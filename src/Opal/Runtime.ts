
import { inspect } from "node:util"

// =============================================================================
// Interpreter
// -----------------------------------------------------------------------------
// This is the Interpreter implementation, not much to see here I guess.
// =============================================================================

import { logger } from './Tools'

import { RuntimeConfig, OutputStream, InputSource, Output } from './Types'
import { OpTreeStream } from './Compiler'
import { Tape, Single, Mix } from './Runtime/Tape'
import {
    Any, PV, CV, GV,
    PRAGMA,
    OP, MaybeOP, OpTree,
} from './Runtime/API'
import { SymbolTable } from './Runtime/SymbolTable'

// -----------------------------------------------------------------------------

export type ThreadID = number

export type Opcode = (i : StackFrame, op : OP) => MaybeOP

export type MaybeOpcode = Opcode | undefined
export type MaybeStackFrame = StackFrame | undefined

export class Pad extends Map<string, Any> {
    [inspect.custom] () {
        let pad : any = {};
        this.forEach((v, k, m) => pad[k] = v);
        return pad;
    }
}

// -----------------------------------------------------------------------------

export class StackFrame {
    public stack      : Any[];
    public padlist    : Pad[];
    public optree     : OpTree; // the CV basically
    public current_op : MaybeOP;
    public return_to  : MaybeOP;

    private parent : MaybeStackFrame;
    private thread : Thread;
    private tape   : Mix;

    constructor(
            optree    : OpTree,
            return_to : MaybeOP,
            thread    : Thread,
            parent?   : MaybeStackFrame,
        ) {
        this.stack      = [];
        this.padlist    = [ new Pad() ];
        this.tape       = new Mix([ optree ]);
        this.optree     = optree;
        this.return_to  = return_to;
        this.thread     = thread;
        this.parent     = parent;
        this.current_op = optree.enter;
    }

    appendOpTree (optree : OpTree) : void {
        this.tape.append(optree);
        this.optree     = optree;
        this.current_op = optree.enter;
    }

    // -------------------------------------------------------------------------
    // Symbol Table
    // -------------------------------------------------------------------------

    executor () : Thread { return this.thread }

    // -------------------------------------------------------------------------
    // Lexicals
    // -------------------------------------------------------------------------

    getLexical (name : string) : Any {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                return scope.get(name) as Any;
            }
            index++;
        }

        if (this.parent == undefined)
            throw new Error(`Unable to get lexical(${name}) in any scope`);

        return this.parent.getLexical(name);
    }

    createLexical (name : string, value : Any) : void {
        this.currentScope().set(name, value);
    }

    setLexical (name : string, value : Any) : void {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                scope.set(name, value);
                return;
            }
            index++;
        }

        if (this.parent == undefined)
            throw new Error(`Unable to set lexical(${name}) in any scope`);

        return this.parent.setLexical(name, value);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    currentScope () : Pad { return this.padlist[0] as Pad }

    enterScope () : void { this.padlist.unshift(new Pad()) }
    leaveScope () : void {
        if (this.padlist.length == 1)
            throw new Error('Cannot leave the global scope!');
        this.padlist.shift()
    }
}

// -----------------------------------------------------------------------------

export class Thread {
    public config  : RuntimeConfig;
    public tid     : ThreadID;
    public frames  : StackFrame[];
    public root    : SymbolTable;

    constructor (tid : ThreadID, root : SymbolTable, config : RuntimeConfig) {
        this.config  = config;
        this.tid     = tid;
        this.frames  = [];
        this.root    = root;
    }

    loadCode (path : string) : InputSource {
        return this.config.resolver(this.config, path);
    }

    invokeCV (cv : CV, args : Any[]) : MaybeOP {
        let parent = this.frames[0] as StackFrame;
        let frame  = new StackFrame(
            cv.contents,
            parent.current_op?.next, // FIXME, this should never be null
            this,
            parent
        );

        // push the args onto the new stack frame
        while (args.length > 0) {
            frame.stack.push(args.pop() as Any);
        }

        this.frames.unshift(frame);

        return frame.current_op;
    }

    returnFromCV () : MaybeOP {
        let old = this.frames.shift();
        if (old == undefined || this.frames.length == 0) throw new Error('Frame Stack Underflow!');

        let cur = this.frames[0] as StackFrame;

        // spill the stack into parent Frame's stack
        while (old.stack.length > 0) {
            cur.stack.push(old.stack.pop() as Any);
        }

        return old.return_to;
    }

    private prepareRootFrame (optree : OpTree) : StackFrame {
        let halt = new OP('halt', {});
        // XXX: gross ... do better
        halt.metadata.compiler.opcode = (i : StackFrame, op : OP) => undefined;

        optree.leave.next = halt;

        let frame = new StackFrame(
            optree,
            halt,
            this,
            undefined
        );

        optree.enter.config.name = '(main)';

        this.frames.unshift(frame);

        return frame;
    }

    async *run (source : OpTreeStream) : OutputStream {
        for await (const optree of source) {
            // Run all the PRAGMAs before running
            // the OpTree itself ...
            while (optree.pragmas.length) {
                let pragma   = optree.pragmas.pop() as PRAGMA;
                let bareword = pragma.config.bareword;
                switch (true) {
                case bareword.startsWith('v'):
                    break;
                default:
                    let src    = this.loadCode(`${pragma.config.bareword}.opal.pm`);
                    let ot     = await pragma.resolver(src);
                    let tape   = new Single(ot);
                    yield* this.run(tape.run());
                }
            }

            yield this.execute(optree);
        }

        if (this.config.DEBUG) {
            logger.log('HALT!');
        }
    }

    execute (optree : OpTree) : Output {
        let frame = this.frames[0] as StackFrame;
        if (frame == undefined) {
            frame = this.prepareRootFrame(optree);
        }

        frame.appendOpTree(optree);

        let depth = this.frames.length;
        while (frame.current_op != undefined) {

            let op : MaybeOP = frame.current_op;
            if (op == undefined) throw new Error(`Expected an OP, and could not find one`);

            let opcode = op.metadata.compiler.opcode;
            if (opcode == undefined)
                throw new Error(`Unlinked OP, no opcode (${op.name} = ${JSON.stringify(op.config)})`)

            depth = this.frames.length

            if (this.config.DEBUG) {
                logger.group(`\x1b[36m${frame.optree.enter.config.name}\x1b[0m ->[\x1b[33m${op.name}\x1b[0m, \x1b[36m${op.metadata.uid}\x1b[0m]`);
            }

            let next_op = opcode(frame, op);

            if (next_op == undefined) {
                if (this.config.DEBUG) logger.groupEnd();
                break;
            }

            if (this.config.DEBUG) {
                let avail_width = (process.stdout.columns - (this.frames.length * 2)) - 2;

                if (this.frames.length > depth) {
                    logger.log('\x1b[32m╭─' + '─'.repeat(avail_width) + '\x1b[0m');
                    logger.log(
                        `\x1b[32m│ \x1b[42m\x1b[30m ${this.frames[0]?.optree.enter.config.name} ▼ \x1b[0m`,
                        this.frames[0]?.stack
                    );
                    logger.group('\x1b[32m╰─' + '─'.repeat(avail_width) + '\x1b[0m');
                }
                else if (this.frames.length < depth) {
                    logger.groupEnd();
                    logger.log('\x1b[33m╭─' + '─'.repeat(avail_width) + '\x1b[0m');
                    logger.log(
                        `\x1b[33m│ \x1b[43m\x1b[30m ${this.frames[0]?.optree.enter.config.name} ▲ \x1b[0m`,
                        this.frames[0]?.stack
                    );
                    logger.log('\x1b[33m╰─' + '─'.repeat(avail_width) + '\x1b[0m');
                } else {

                    logger.log('\x1b[34m├─\x1b[35m stack :\x1b[0m', frame.stack.toReversed());
                    logger.log('\x1b[34m╰──\x1b[35m pads :\x1b[0m', frame.padlist);
                }
                logger.groupEnd();
            }

            frame = this.frames[0] as StackFrame;
            frame.current_op = next_op;
        }


        if (this.STD_buffer.length > 0) {
            return this.STD_buffer.splice(0).map((pv) => pv.value);
        }
        else if (this.ERR_buffer.length > 0) {
            return this.ERR_buffer.splice(0).map((pv) => pv.value);
        }
        else {
            return [] as Output;
        }
    }

    // -------------------------------------------------------------------------
    // I/O
    // -------------------------------------------------------------------------

    public STD_buffer : PV[] = [];
    public ERR_buffer : PV[] = [];

    toSTDOUT (args : PV[]) : void {
        this.STD_buffer.push(...args);
    }

    toSTDERR (args : PV[]) : void {
        this.ERR_buffer.push(...args);
    }

}

// -----------------------------------------------------------------------------
