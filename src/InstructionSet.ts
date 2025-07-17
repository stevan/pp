// =============================================================================
// Instruction Set
// -----------------------------------------------------------------------------
// This contains all the opcodes that will be referenced in the OP tree, which
// is emited by the AST and then executed by the interpreter.
// =============================================================================

import { logger } from './Logger'
import {
    SV, Pad,
    Stash, newStash,
    newIV, assertIsIV,
    SV_True, SV_False, SV_Undef, isUndef,
    SymbolTable, assertIsGlob,
    OP, MaybeOP, OpTree,
    assertIsBool, isTrue,
    LOGOP,
} from './Runtime'

import { GlobSlot } from './AST'

// -----------------------------------------------------------------------------

export interface Executor {
    stack   : SV[];
    padlist : Pad[];
    root    : SymbolTable;

    currentScope () : Pad;
    enterScope   () : void;
    leaveScope   () : void;

    createLexical (name : string, value : SV) : void;
    setLexical    (name : string, value : SV) : void;
    getLexical    (name : string) : SV;

    run (root : OpTree) : void;
}

// Opcodes return MaybeOP because the final `leave`
// will not have a next OP to go to. This could probably
// be fixed, but it is okay for now.
export type Opcode = (i : Executor, op : OP) => MaybeOP;

// -----------------------------------------------------------------------------

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

export class InstructionSet extends Map<string, Opcode> {}

export function loadInstructionSet () : InstructionSet {

    let opcodes = new InstructionSet();

    // ---------------------------------------------------------------------
    // Enter/Leave
    // ---------------------------------------------------------------------

    opcodes.set('enter', (i, op) => op.next);
    opcodes.set('leave', (i, op) => op.next);

    opcodes.set('enterscope', (i, op) => { i.enterScope(); return op.next });
    opcodes.set('leavescope', (i, op) => { i.leaveScope(); return op.next });

    opcodes.set('nextstate', (i, op) => op.next);

    // ---------------------------------------------------------------------
    // Control Structures
    // ---------------------------------------------------------------------

    opcodes.set('cond_expr', (i, op) => {
        let bool = i.stack.pop() as SV;
        assertIsBool(bool);
        if (isTrue(bool) && op instanceof LOGOP) {
            return op.other;
        } else {
            return op.next;
        }
    });

    opcodes.set('goto', (i, op) => op.next);

    // ---------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------

    opcodes.set('const', (i, op) => {
        i.stack.push(newIV(op.config.literal));
        return op.next;
    });

    opcodes.set('undef', (i, op) => {
        i.stack.push(SV_Undef);
        return op.next;
    });

    // ---------------------------------------------------------------------
    // Glob operations
    // ---------------------------------------------------------------------

    // FIXME:
    // these only work SVs for now

    opcodes.set('gv', (i, op) => op.next);

    opcodes.set('gv_store', (i, op) => {
        let target = op.config.target;

        let gv = i.root.autovivify(target.name);
        assertIsGlob(gv);

        gv.slots.SCALAR = i.stack.pop() as SV;

        return op.next
    });

    opcodes.set('gv_fetch', (i, op) => {
        let target = op.config.target;

        let gv = i.root.autovivify(target.name);
        assertIsGlob(gv);
        i.stack.push( gv.slots.SCALAR );

        return op.next;
    });

    // ---------------------------------------------------------------------
    // Pad SV operations
    // ---------------------------------------------------------------------

    // This is a NOOP, the fetch/store have config.target instead
    opcodes.set('padsv', (i, op) => op.next);

    opcodes.set('padsv_store', (i, op) => {
        // NOTE: ponder splitting this into two opcodes
        // one for the store and one for the declare
        if (op.config.introduce) {
            i.createLexical(op.config.target.name, i.stack.pop() as SV);
        } else {
            i.setLexical(op.config.target.name, i.stack.pop() as SV);
        }
        return op.next
    });

    opcodes.set('padsv_fetch', (i, op) => {
        let t = i.getLexical(op.config.target.name);
        i.stack.push(t as SV);
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

    opcodes.set('add',      LiftNumericBinOp((n, m) => n + m));
    opcodes.set('subtract', LiftNumericBinOp((n, m) => n - m));
    opcodes.set('multiply', LiftNumericBinOp((n, m) => n * m));

    // ---------------------------------------------------------------------
    // Eq & Ord
    // ---------------------------------------------------------------------

    opcodes.set('eq', LiftNumericPredicate((n, m) => n == m));
    opcodes.set('ne', LiftNumericPredicate((n, m) => n != m));

    opcodes.set('gt', LiftNumericPredicate((n, m) => n > m));
    opcodes.set('lt', LiftNumericPredicate((n, m) => n < m));

    opcodes.set('ge', LiftNumericPredicate((n, m) => n >= m));
    opcodes.set('le', LiftNumericPredicate((n, m) => n <= m));


    // ---------------------------------------------------------------------

    return opcodes;
}
