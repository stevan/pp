
import { inspect } from "node:util"

// =============================================================================
// Interpreter
// -----------------------------------------------------------------------------
// This is the Interpreter implementation, not much to see here I guess.
// =============================================================================

import { logger } from './Tools'

import { RuntimeConfig } from './Types'
import {
    Any, PV, CV, GV,
    OP, MaybeOP, OpTree,
    Stash, newStash, Glob, newGlob, isGlob,
} from './Runtime/API'

export type { PV } from './Runtime/API'

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
// Symbol Table
// -----------------------------------------------------------------------------
// This is very basic at the moment, but this should ultimately be kind of a
// in-memory NOSQL database. Passing a fully qualified symbol is the same as
// doing an primary key lookup, and it would be possible to have kind of a
// "query" syntax, which would be able to replace dynamically creating symbols
// at runtime. No idea what that might look like yet, but it is an idea.
//
// But treating this as a database allows us to save state, similar to an
// image file in Smalltalk or Forth, and be able to bypass the compilation
// and composition of a symbol table which won't change unless the file
// changes. This would also make it easier to have an interactive development
// environment similar to Unison and others.
// -----------------------------------------------------------------------------

export class SymbolTable {
    public root : Stash;

    constructor(name : string) {
        this.root = newStash(name);
    }

    name () : string { return this.root.name }

    // NOTE:
    // This works for now, but I do not like the
    // return values being so different, even though
    // they are from the same type. And the :: postfix
    // being important is also kinda janky and not
    // ideal. So this should eventually change to
    // be something less DWIM-ey, but yeah, kinda
    // works for now.
    autovivify (symbol : string) : GV {
        let path = symbol.split('::');
        if (path.length == 0) throw new Error('Autovivify path is empty');

        let wantStash = false;
        if (path[ path.length - 1 ] == '') {
            path.pop();
            wantStash = true;
        }

        let current = this.root;
        while (path.length > 0) {
            let segment = path.shift() as string;
            if (current.stash.has(segment)) {
                let next = current.stash.get(segment) as GV;
                // terminal case for lookup ...
                if (isGlob(next) && path.length == 0 && !wantStash) {
                    return next;
                }
                else {
                    current = next as Stash;
                }
            } else {
                // terminal case for auto creation ... we want a glob
                if (path.length == 0 && !wantStash) {
                    let glob = newGlob(segment);
                    current.stash.set(segment, glob);
                    return glob;
                }
                else {
                    let stash = newStash(segment);
                    current.stash.set(segment, stash);
                    current = stash;
                }
            }
        }

        // XXX:
        // perhaps add something here to check wantStash
        // and the type of current, to make sure we aren't
        // sending back the wrong type. Just an example of
        // the issues with this, but meh, I will come back.

        return current;
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

    constructor(
            optree    : OpTree,
            return_to : MaybeOP,
            thread    : Thread,
            parent?   : MaybeStackFrame,
        ) {
        this.stack       = [];
        this.padlist     = [ new Pad() ];
        this.optree      = optree;
        this.return_to   = return_to;
        this.thread = thread;
        this.parent      = parent;
        this.current_op  = optree.enter;
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
        throw new Error(`Unable to find lexical(${name}) in any scope`);
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
        this.createLexical(name, value);
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

    private prepareRootFrame (optree : OpTree) : void {
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
    }

    run (root : OpTree) : void {
        this.prepareRootFrame(root);

        let frame = this.frames[0] as StackFrame;

        let depth = this.frames.length;
        while (frame.current_op != undefined) {

            let op : MaybeOP = frame.current_op;
            if (op == undefined) throw new Error(`Expected an OP, and could not find one`);

            let opcode = op.metadata.compiler.opcode;
            if (opcode == undefined)
                throw new Error(`Unlinked OP, no opcode (${op.name} = ${JSON.stringify(op.config)})`)

            depth = this.frames.length

            if (this.config.DEBUG) {
                logger.group(

    `\x1b[36m${frame.optree.enter.config.name}\x1b[0m ->[\x1b[33m${op.name}\x1b[0m, \x1b[36m${op.metadata.uid}\x1b[0m]`);
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

        if (this.config.DEBUG) {
            logger.log('HALT!');
        }
    }

    // -------------------------------------------------------------------------
    // I/O
    // -------------------------------------------------------------------------

    public STD_buffer : PV[] = [];
    public ERR_buffer : PV[] = [];

    toSTDOUT (args : PV[]) : void {
        this.STD_buffer.push(...args);
        if (this.config.DEBUG) {
            console.log('\x1b[44m  STDOUT ▶ :\x1b[45m', args.map((pv) => pv.value).join(''), '\x1b[0m');
        } else {
            // FIXME: this should use stdout
            console.log(args.map((pv) => pv.value).join(''));
        }
    }

    toSTDERR (args : PV[]) : void {
        this.ERR_buffer.push(...args);
        if (this.config.DEBUG) {
            console.log('\x1b[41m  STDERR ▶ \x1b[45m', args.map((pv) => pv.value).join(''), '\x1b[0m');
        } else {
            if (!this.config.QUIET) {
                // FIXME: this should use stderr
                console.log(args.map((pv) => pv.value).join(''));
            }
        }
    }

}

// -----------------------------------------------------------------------------
