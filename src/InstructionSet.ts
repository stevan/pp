// =============================================================================
// Instruction Set
// -----------------------------------------------------------------------------
// This contains all the opcodes that will be referenced in the OP tree, which
// is emited by the AST and then executed by the interpreter.
// =============================================================================

import { logger } from './Logger'
import {
    Any, SV, IV, NV, PV, CV, Stash, SymbolTable,

    SV_True, SV_False, SV_Undef,

    newStash, newCV, newIV, newPV, newNV,

    assertIsSV, assertIsPV, assertIsIV, assertIsCV,
    assertIsGlob, assertIsBool,

    SVtoPV, isUndef, isTrue,
    setGlobScalar, setGlobCode, getGlobSlot,

    OP, LOGOP, DECLARE, MaybeOP, OpTree,

    Executor, MaybeActivationRecord, ActivationRecord,

    InstructionSet, Opcode,
} from './Runtime'

import { GlobSlot } from './AST'

// -----------------------------------------------------------------------------
// Utils to lift some BinOps
// -----------------------------------------------------------------------------

function LiftNumericBinOp (f : (n: number, m: number) => number) : Opcode {
    // FIXME:
    // This currenly only works for IVs, it should
    // detect if either check the lhs/rhs values at
    // runtime and DWIM, or the compiler should figure
    // it out and use the correct opcode. But this is
    // an MVP, so this is fine for now.
    return (i, op) => {
        let rhs = i.stack.pop() as Any;
        let lhs = i.stack.pop() as Any;
        assertIsIV(lhs);
        assertIsIV(rhs);
        i.stack.push(newIV( f(lhs.value, rhs.value) ));
        return op.next;
    }
}

function LiftNumericPredicate (f : (n: number, m: number) => boolean) : Opcode {
    // FIXME:
    // This currenly only works for IVs, it should
    // detect if either check the lhs/rhs values at
    // runtime and DWIM, or the compiler should figure
    // it out and use the correct opcode. But this is
    // an MVP, so this is fine for now.
    return (i, op) => {
        let rhs = i.stack.pop() as Any;
        let lhs = i.stack.pop() as Any;
        assertIsIV(lhs);
        assertIsIV(rhs);
        i.stack.push( f(lhs.value, rhs.value) ? SV_True : SV_False );
        return op.next;
    }
}

// -----------------------------------------------------------------------------
// Subroutine calls
// -----------------------------------------------------------------------------

const PUSHMARK = newPV('*PUSHMARK*');

function collectArgumentsFromStack (i : ActivationRecord) : Any[] {
    let args = [];
    while (true) {
        let arg = i.stack.pop();
        if (arg == undefined) throw new Error('Stack Underflow!');
        if (arg === PUSHMARK) {
            break;
        } else {
            // NOTE:
            // This may be wrong, not sure, and I
            // might then be correcting for this
            // elsewhere, but I can't figure out
            // where it is. And since things work
            // I am just gonna leave this here.
            args.unshift(arg);
        }
    }
    return args;
}

// -----------------------------------------------------------------------------
// the instruction set ...
// -----------------------------------------------------------------------------

export function loadInstructionSet () : InstructionSet {

    let opcodes = new InstructionSet();

    // ---------------------------------------------------------------------
    // Compile Time Ops
    // ---------------------------------------------------------------------

    opcodes.set('declare', (i, op) => {
        if (!(op instanceof DECLARE)) throw new Error('Y NO DECLARE?')
        let cv = newCV(op.declaration);
        let gv = i.executor().root.autovivify(op.config.name);
        assertIsGlob(gv);
        setGlobCode(gv, cv);
        return op.next
    });

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
        let bool = i.stack.pop() as Any;
        assertIsBool(bool);
        if (isTrue(bool) && op instanceof LOGOP) {
            return op.other;
        } else {
            return op.next;
        }
    });

    opcodes.set('goto', (i, op) => op.next);

    // ---------------------------------------------------------------------
    // Sub Calls
    // ---------------------------------------------------------------------

    // --------------------------------
    // calling sub
    // --------------------------------

    // mark the start of arguments
    opcodes.set('pushmark', (i, op) => {
        i.stack.push(PUSHMARK);
        return op.next
    });

    // call the sub itself
    opcodes.set('callsub', (i, op) => {
        let args = collectArgumentsFromStack(i);
        let cv   = args.pop();
        if (cv == undefined) throw new Error('Expected CV on stack for callsub');
        assertIsCV(cv);

        let next_op = i.executor().invokeCV(
            cv,     // sub to call
            args,   // args from parent frame
        );

        return next_op;
    });

    // --------------------------------
    // enter sub
    // --------------------------------

    // this handles the args
    opcodes.set('entersub', (i, op) => {
        let params = op.config.params;

        if (params.length > 0) {
            if (i.stack.length < params.length)
                throw new Error(`${op.config.name} expected ${params.length} only got ${i.stack.length}`);
            for (const param of params) {
                let sv = i.stack.pop() as Any;
                assertIsSV(sv);
                i.createLexical(param, sv);
            }
        }

        return op.next
    });

    // --------------------------------
    // leaveing a subroutine
    // --------------------------------

    // NOTE:
    // these two are functionality equivalent
    // though this feels too easy. As long as
    // the leavesub doesn't do anything other
    // than just returnFromCV, then they it
    // should be okay. Just not 100% sure :)

    opcodes.set('return', (i, op) => {
        return i.executor().returnFromCV();
    });

    opcodes.set('leavesub', (i, op) => {
        return i.executor().returnFromCV();
    });

    // ---------------------------------------------------------------------
    // Builtins
    // ---------------------------------------------------------------------

    opcodes.set('say', (i, op) => {
        let args = collectArgumentsFromStack(i);
        i.executor().toSTDOUT(args.map((sv) => {
            // TODO: handle things other than scalars ...
            assertIsSV(sv);
            return SVtoPV(sv);
        }));
        return op.next;
    });

    opcodes.set('join', (i, op) => {
        let args = collectArgumentsFromStack(i);

        let sep = args.shift();
        if (sep == undefined) throw new Error('Expected seperator arg for join');
        assertIsPV(sep);
        i.stack.push(
            newPV(args.map((sv) => {
                // TODO: handle things other than scalars ...
                assertIsSV(sv);
                return SVtoPV(sv).value;
            }).join(sep.value))
        );

        return op.next;
    });

    // ---------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------

    opcodes.set('const', (i, op) => {
        if (op.config.type == 'IV') {
            i.stack.push(newIV(op.config.literal as number));
        }
        else if (op.config.type == 'NV') {
            i.stack.push(newNV(op.config.literal as number));
        }
        else if (op.config.type == 'PV') {
            i.stack.push(newPV(op.config.literal as string));
        }
        return op.next;
    });

    opcodes.set('undef', (i, op) => {
        i.stack.push(SV_Undef);
        return op.next;
    });

    opcodes.set('false', (i, op) => {
        i.stack.push(SV_False);
        return op.next;
    });

    opcodes.set('true', (i, op) => {
        i.stack.push(SV_True);
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

        let gv = i.executor().root.autovivify(target.name);
        assertIsGlob(gv);

        let sv = i.stack.pop() as Any;
        assertIsSV(sv);
        setGlobScalar(gv, sv);

        return op.next
    });

    opcodes.set('gv_fetch', (i, op) => {
        let target = op.config.target;

        let gv = i.executor().root.autovivify(target.name);
        assertIsGlob(gv);
        i.stack.push( getGlobSlot(gv, target.slot) );

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
        let sv = i.stack.pop() as Any;
        assertIsSV(sv);
        if (op.config.introduce) {
            i.createLexical(op.config.target.name, sv);
        } else {
            i.setLexical(op.config.target.name, sv);
        }
        return op.next
    });

    opcodes.set('padsv_fetch', (i, op) => {
        let t = i.getLexical(op.config.target.name);
        i.stack.push(t);
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
    opcodes.set('modulo',   LiftNumericBinOp((n, m) => n % m));

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
