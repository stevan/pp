// =============================================================================
// Instruction Set
// -----------------------------------------------------------------------------
// This contains all the opcodes that will be referenced in the OP tree, which
// is emited by the AST and then executed by the interpreter.
// =============================================================================

import { logger } from './Logger'
import {
    Any, SV, IV, NV, PV, CV, Pad, SVtoPV, assertIsSV, assertIsPV,
    Stash, newStash, newCV,
    newIV, assertIsIV, newPV, newNV,
    SV_True, SV_False, SV_Undef, isUndef, assertIsCV,
    SymbolTable, assertIsGlob,
    OP, MaybeOP, OpTree,
    assertIsBool, isTrue,
    LOGOP, DECLARE,
    setGlobScalar, setGlobCode, getGlobSlot,
} from './Runtime'

import { GlobSlot } from './AST'

// -----------------------------------------------------------------------------

export type MaybeActivationRecord = ActivationRecord | undefined

export interface ActivationRecord {
    stack      : Any[];
    padlist    : Pad[];
    optree     : OpTree;
    return_to  : MaybeOP;
    current_op : MaybeOP;

    currentScope () : Pad;
    enterScope   () : void;
    leaveScope   () : void;

    createLexical (name : string, value : SV) : void;
    setLexical    (name : string, value : SV) : void;
    getLexical    (name : string) : SV;

    executor () : Executor;
}

export interface Executor {
    frames  : ActivationRecord[];
    opcodes : InstructionSet;
    root    : SymbolTable;

    invokeCV (cv : CV, args : Any[]) : MaybeOP;
    returnFromCV () : MaybeOP;

    run (root : OpTree) : void;

    toSTDOUT (args : PV[]) : void;
    toSTDERR (args : PV[]) : void;
}

// Opcodes return MaybeOP because the final `leave`
// will not have a next OP to go to. This could probably
// be fixed, but it is okay for now.
export type Opcode = (i : ActivationRecord, op : OP) => MaybeOP;

// -----------------------------------------------------------------------------

function LiftNumericBinOp (f : (n: number, m: number) => number) : Opcode {
    // NOTE:
    // This currenly only works for IVs, it should
    // detect if either check the lhs/rhs values at
    // runtime and DWIM, or the compiler should figure
    // it out and use the correct opcode. But this is
    // an MVP, so this is fine for now.
    return (i, op) => {
        let lhs = i.stack.pop() as Any;
        let rhs = i.stack.pop() as Any;
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
        let lhs = i.stack.pop() as Any;
        let rhs = i.stack.pop() as Any;
        assertIsIV(lhs);
        assertIsIV(rhs);
        i.stack.push( f(lhs.value, rhs.value) ? SV_True : SV_False );
        return op.next;
    }
}

// -----------------------------------------------------------------------------

export class InstructionSet extends Map<string, Opcode> {}

const PUSHMARK = newPV('*PUSHMARK*');

function collectArgumentsFromStack (i : ActivationRecord) : Any[] {
    let args = [];
    while (true) {
        let arg = i.stack.pop();
        if (arg == undefined) throw new Error('Stack Underflow!');
        if (arg === PUSHMARK) {
            break;
        } else {
            args.unshift(arg);
        }
    }
    return args;
}

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

    opcodes.set('halt', (i, op) => {
        return undefined;
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

    opcodes.set('pushmark', (i, op) => {
        i.stack.push(PUSHMARK);
        return op.next
    });

    opcodes.set('return', (i, op) => {
        return i.executor().returnFromCV();
    });

    opcodes.set('argcheck', (i, op) => {
        // create the Arg Lexicals ...
        return op.next
    });

    // ...

    opcodes.set('leavesub', (i, op) => {
        return i.executor().returnFromCV();
    });

    opcodes.set('entersub', (i, op) => {
        // hmmm? this could be argcheck ...
        return op.next
    });

    // ...

    opcodes.set('callsub', (i, op) => {
        let args = collectArgumentsFromStack(i);
        let cv   = args.pop();
        if (cv == undefined) throw new Error('Expected CV on stack for callsub');
        assertIsCV(cv);

        let next_op = i.executor().invokeCV( // should be EnterSub
            cv,     // sub to call
            args,   // args from parent frame
        );

        return next_op;
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
