
import { inspect } from "node:util"

import { logger } from '../Tools'

import { RuntimeConfig, SyncOutputStream, OutputStream, InputSource, Output } from '../Types'
import { OpTreeStream } from '../Compiler'
import { StackFrame } from './StackFrame'
import { Tape, Single, Mix } from './Tape'
import {
    Any, PV, CV, GV, AnytoPV,
    PRAGMA,
    OP, MaybeOP, OpTree,
} from './API'
import { SymbolTable } from './SymbolTable'
import { Executor, ThreadID, OutputHandle } from '../Runtime'

export class BasicOutput implements OutputHandle {
    public buffer : Any[] = [];

    write ( args : Any[] ) : void {
        this.buffer.push(...args);
    }

    get pending () : boolean { return this.buffer.length > 0 }

    flush () : Output {
        return this.buffer.splice(0)
                          .map((sv) => AnytoPV(sv))
                          .flat(1)
                          .map((pv) => pv.value);
    }
}

export class Thread implements Executor {
    public config  : RuntimeConfig;
    public tid     : ThreadID;
    public frames  : StackFrame[];
    public root    : SymbolTable;
    public output  : OutputHandle;

    constructor (tid : ThreadID, root : SymbolTable, config : RuntimeConfig) {
        this.config  = config;
        this.tid     = tid;
        this.frames  = [];
        this.root    = root;
        this.output  = new BasicOutput();
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

            yield* this.execute(optree);
        }
    }

    *execute (optree : OpTree) : SyncOutputStream {
        let frame = this.frames[0] as StackFrame;

        if (frame == undefined) {
            frame = this.prepareRootFrame(optree);
        }

        frame.appendOpTree(optree);

        while (frame.current_op != undefined) {

            let op : MaybeOP = frame.current_op;
            if (op == undefined)
                throw new Error(`Expected an OP, and could not find one`);

            let opcode = op.metadata.compiler.opcode;
            if (opcode == undefined)
                throw new Error(`Unlinked OP, no opcode (${op.name} = ${JSON.stringify(op.config)})`)

            console.log(`\x1b[3${this.tid}m[${this.tid}] :: op[${op.name}]\x1b[0m`)
            let next_op = opcode(frame, op);

            if (next_op == undefined) {
                break;
            }

            frame = this.frames[0] as StackFrame;
            frame.current_op = next_op;

            if (this.output.pending) {
                console.log(`PENDING I/O FOR ${this.tid}`);
                yield this.output.flush() as Output;
            }
        }

        if (this.output.pending) {
            yield this.output.flush() as Output;
        }
    }

    // -------------------------------------------------------------------------
    // Private stuff
    // -------------------------------------------------------------------------

    private loadCode (path : string) : InputSource {
        return this.config.resolver(this.config, path);
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

    // -------------------------------------------------------------------------
    // CV handling
    // -------------------------------------------------------------------------

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

}

// -----------------------------------------------------------------------------
