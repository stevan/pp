// =============================================================================
// Interpreter
// -----------------------------------------------------------------------------
// This is the Interpreter implementation, not much to see here I guess.
// =============================================================================

import { logger } from './Logger'
import {
    Any, SV, PV, CV, SymbolTable,
    OP, MaybeOP, OpTree,
    Pad
} from './Runtime'

import {
    InstructionSet,
    loadInstructionSet,
    Executor, ActivationRecord, MaybeActivationRecord,
} from './InstructionSet'

import { GlobSlot } from './AST'

// -----------------------------------------------------------------------------

class StackFrame implements ActivationRecord {
    public stack      : Any[];
    public padlist    : Pad[];
    public optree     : OpTree; // the CV basically
    public current_op : MaybeOP;
    public return_to  : MaybeOP;

    private parent      : MaybeActivationRecord;
    private interpreter : Interpreter;

    constructor(
            optree      : OpTree,
            return_to   : MaybeOP,
            interpreter : Interpreter,
            parent?     : MaybeActivationRecord
        ) {
        this.stack       = [];
        this.padlist     = [ new Pad() ];
        this.optree      = optree;
        this.return_to   = return_to;
        this.interpreter = interpreter;
        this.parent      = parent;
        this.current_op  = optree.enter;
    }

    // -------------------------------------------------------------------------
    // Symbol Table
    // -------------------------------------------------------------------------

    executor () : Executor { return this.interpreter }

    // -------------------------------------------------------------------------
    // Lexicals
    // -------------------------------------------------------------------------

    getLexical (name : string) : SV {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                return scope.get(name) as SV;
            }
            index++;
        }
        throw new Error(`Unable to find lexical(${name}) in any scope`);
    }

    createLexical (name : string, value : SV) : void {
        this.currentScope().set(name, value);
    }

    setLexical (name : string, value : SV) : void {
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


export class Interpreter implements Executor {
    public frames  : StackFrame[];
    public root    : SymbolTable;
    public opcodes : InstructionSet;

    constructor () {
        this.frames  = [];
        this.root    = new SymbolTable('main');
        this.opcodes = loadInstructionSet();
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

    run (root : OpTree, options : any = {}) : void {
        this.prepareRootFrame(root);

        let frame = this.frames[0] as StackFrame;

        while (frame.current_op != undefined) {

            let op : MaybeOP = frame.current_op;

            let opcode = this.opcodes.get(op.name);
            if (opcode == undefined) throw new Error(`Could not find opcode(${op.name})`);

            let depth = this.frames.length;

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

        this.frames = [];
    }

    // -------------------------------------------------------------------------
    // I/O
    // -------------------------------------------------------------------------

    toSTDOUT (args : PV[]) : void {
        console.log('STDOUT>', args.map((pv) => pv.value).join(''));
    }

    toSTDERR (args : PV[]) : void {
        console.log('STDERR>', args.map((pv) => pv.value).join(''));
    }

}
