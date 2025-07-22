// =============================================================================
// Interpreter
// -----------------------------------------------------------------------------
// This is the Interpreter implementation, not much to see here I guess.
// =============================================================================

import { logger } from './Tools'
import {
    Any, SV, PV, CV, SymbolTable,
    OP, MaybeOP, OpTree,
    Pad,
    Executor, ActivationRecord, MaybeActivationRecord,
    InstructionSet, Opcode,
} from './Runtime/API'

// -----------------------------------------------------------------------------

export class StackFrame implements ActivationRecord {
    public stack      : Any[];
    public padlist    : Pad[];
    public optree     : OpTree; // the CV basically
    public current_op : MaybeOP;
    public return_to  : MaybeOP;

    private parent : MaybeActivationRecord;
    private thread : Executor;

    constructor(
            optree    : OpTree,
            return_to : MaybeOP,
            thread    : Executor,
            parent?   : MaybeActivationRecord,
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

    executor () : Executor { return this.thread }

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

export type InterpreterOptions = any;

export type ThreadID = number;

export class ThreadMap extends Map<ThreadID, Thread> {
    addThread(t : Thread) : void { this.set(t.tid, t) }
}

export class Interpreter {
    public options : InterpreterOptions;
    public main    : Thread;
    public root    : SymbolTable;
    public threads : ThreadMap;

    private tid_seq : ThreadID = 0;

    constructor (options : InterpreterOptions = {}) {
        this.options = options;
        this.root    = new SymbolTable('main');
        this.threads = new ThreadMap();
        this.main    = this.initializeMainThread();
    }

    private initializeMainThread () : Thread {
        let thread = new Thread(++this.tid_seq, this.root);
        this.threads.addThread(thread);
        return thread;
    }

    run (root : OpTree) : void {
        this.main.run(root, this.options);
    }
}

export class Thread implements Executor {
    public tid     : ThreadID;
    public frames  : StackFrame[];
    public root    : SymbolTable;

    constructor (tid : ThreadID, root : SymbolTable) {
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
        halt.metadata.compiler.opcode = (i : ActivationRecord, op : OP) => undefined;

        optree.leave.next = halt;

        let frame = new StackFrame(
            optree,
            halt,
            this,
            undefined
        );

        optree.enter.config.name = '__main__';

        this.frames.unshift(frame);
    }

    run (root : OpTree, options : InterpreterOptions = {}) : void {
        this.prepareRootFrame(root);

        let frame = this.frames[0] as StackFrame;

        while (frame.current_op != undefined) {

            let op : MaybeOP = frame.current_op;
            if (op == undefined) throw new Error(`Expected an OP, and could not find one`);

            let opcode = op.getOpcode();
            if (opcode == undefined)
                throw new Error(`Unlinked OP, no opcode (${op.name} = ${JSON.stringify(op.config)})`)

            let depth  = this.frames.length;

            if (options.DEBUG)
                logger.group(`[${depth}] {${frame.optree.enter.config.name}} -> OP[${op.name}] = ${JSON.stringify(op.config)}`);

            let next_op = opcode(frame, op);
            if (next_op == undefined) {
                if (options.DEBUG) logger.groupEnd();
                break;
            }

            if (options.DEBUG) {
                if (this.frames.length > depth) {
                    logger.log('ARGS    :', this.frames[0]?.stack);
                }

                if (this.frames.length < depth) {
                    logger.log('RETURN  :', this.frames[0]?.stack);
                }

                logger.log('STACK   :', frame.stack);
                logger.log('PADLIST :', frame.padlist);
                //logger.log('SYMTBL  :', this.root);
                logger.groupEnd();
            }

            frame = this.frames[0] as StackFrame;
            frame.current_op = next_op;
        }

        if (options.DEBUG) {
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
        console.log('STDOUT>', args.map((pv) => pv.value).join(''));
    }

    toSTDERR (args : PV[]) : void {
        this.ERR_buffer.push(...args);
        console.log('STDERR>', args.map((pv) => pv.value).join(''));
    }

}
