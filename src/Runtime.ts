
import { logger } from './Logger'
import {
    SV,
    Stash, newStash,
    newIV, assertIsIV,
    SV_True, SV_False
} from './SymbolTable'

import {
    OP, MaybeOP, OpTree
} from './OpTree'

// -----------------------------------------------------------------------------

// Opcodes return MaybeOP because the final `leave`
// will not have a next OP to go to. This could probably
// be fixed, but it is okay for now.
export type Opcode = (i : Interpreter, op : OP) => MaybeOP;

function LiftNumericBinOp (f : (n: number, m: number) => number) : Opcode {
    // NOTE:
    // This currenly only works for IVs, it should
    // detect if either check the lhs/rhs values at
    // runtime and DWIM, or the compiler should figure
    // it out and use the correct opcode. But this is
    // an MVP, so this is fine for now.
    return (i, op) => {
        let lhs = i.stack.pop() as SV;
        let rhs = i.stack.pop() as SV;
        assertIsIV(lhs);
        assertIsIV(rhs);
        i.stack.push(newIV( f(lhs.value, rhs.value) ));
        return op.next;
    }
}

function LiftNumericPredicate (f : (n: number, m: number) => boolean) : Opcode {
    // NOTE:
    // This currenly only works for IVs, it should
    // detect if either check the lhs/rhs values at
    // runtime and DWIM, or the compiler should figure
    // it out and use the correct opcode. But this is
    // an MVP, so this is fine for now.
    return (i, op) => {
        let lhs = i.stack.pop() as SV;
        let rhs = i.stack.pop() as SV;
        assertIsIV(lhs);
        assertIsIV(rhs);
        i.stack.push( f(lhs.value, rhs.value) ? SV_True : SV_False );
        return op.next;
    }
}

// -----------------------------------------------------------------------------

export class Pad extends Map<string, SV> {}

export class Interpreter {
    public stack   : SV[];
    public padlist : Pad[];
    public root    : Stash;
    public opcodes : Map<string, Opcode>;

    constructor () {
        this.stack   = [];
        this.padlist = [ new Pad() ];
        this.root    = newStash('main::');

        this.opcodes = new Map<string, Opcode>();

        // ---------------------------------------------------------------------
        // Enter/Leave
        // ---------------------------------------------------------------------

        this.opcodes.set('enter', (i, op) => op.next);
        this.opcodes.set('leave', (i, op) => op.next);

        this.opcodes.set('nextstate', (i, op) => op.next);

        // ---------------------------------------------------------------------
        // Constants
        // ---------------------------------------------------------------------

        this.opcodes.set('const', (i, op) => {
            i.stack.push(newIV(op.config.literal));
            return op.next;
        });

        // ---------------------------------------------------------------------
        // Pad SV operations
        // ---------------------------------------------------------------------

        this.opcodes.set('padsv_store', (i, op) => {
            i.currentScope().set(op.config.target, i.stack.pop() as SV);
            return op.next
        });

        this.opcodes.set('padsv_fetch', (i, op) => {
            let t = i.currentScope().get(op.config.target);
            if (t != undefined) {
                i.stack.push(t as SV);
            }
            return op.next;
        });


        // ---------------------------------------------------------------------
        // Operators
        // ---------------------------------------------------------------------
        // NOTE:
        // These are all work only on IVs for now
        // see comments in LiftNumericBinOp above.

        // ---------------------------------------------------------------------
        // Maths
        // ---------------------------------------------------------------------

        this.opcodes.set('add', LiftNumericBinOp((n, m) => n + m));
        this.opcodes.set('sub', LiftNumericBinOp((n, m) => n - m));
        this.opcodes.set('mul', LiftNumericBinOp((n, m) => n * m));

        // ---------------------------------------------------------------------
        // Eq & Ord
        // ---------------------------------------------------------------------

        this.opcodes.set('eq', LiftNumericPredicate((n, m) => n == m));
        this.opcodes.set('ne', LiftNumericPredicate((n, m) => n != m));

        this.opcodes.set('gt', LiftNumericPredicate((n, m) => n > m));
        this.opcodes.set('lt', LiftNumericPredicate((n, m) => n < m));

        this.opcodes.set('ge', LiftNumericPredicate((n, m) => n >= m));
        this.opcodes.set('le', LiftNumericPredicate((n, m) => n <= m));


        // ---------------------------------------------------------------------
    }

    currentScope () : Pad { return this.padlist[0] as Pad }

    enterScope () : void { this.padlist.unshift(new Pad()) }
    leaveScope () : void { this.padlist.pop() }

    run (root : OpTree) : void {
        let op : MaybeOP = root.enter;
        while (op != undefined) {
            let opcode = this.opcodes.get(op.name);
            if (opcode == undefined) throw new Error(`Could not find opcode(${op.name})`);
            logger.group(`*OPCODE[${op.name}] = ${JSON.stringify(op.config)}`);
            op = opcode(this, op);
            logger.log('STACK   :', this.stack);
            logger.log('PADLIST :', this.padlist);
            logger.groupEnd();
        }
    }
}
