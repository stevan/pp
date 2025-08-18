// =============================================================================
// Instruction Set
// -----------------------------------------------------------------------------
// This contains all the opcodes that will be referenced in the OP tree, which
// is emited by the AST and then executed by the interpreter.
// =============================================================================

import { prettyPrinter } from '../Tools'
import { walkTraversalOrder } from '../Compiler/OpTreeWalker'
import { StackFrame } from '../Runtime/StackFrame'
import {
    Any, IV, NV, PV, CV,

    SV_True, SV_False, SV_Undef,

    newCV, newIV, newPV, newNV, newAV,

    isSV, isAV, isCV,

    assertIsSV, assertIsPV, assertIsCV, assertIsAV,
    assertIsGlob, assertIsBool,
    assertIsComparable, assertIsNumeric, assertIsStringy,

    SVtoPV, SVtoBool, AnytoPV, isTrue, isFalse, isUndef,
    setGlobScalar, setGlobCode, getGlobSlot,

    Stash,
    GlobSlot,

    OP, BINOP, LOGOP, LOOPOP, DECLARE, PRAGMA, MaybeOP,
} from './API'

// -----------------------------------------------------------------------------
// the instruction set ...
// -----------------------------------------------------------------------------

export type Opcode = (i : StackFrame, op : OP) => MaybeOP

export type MaybeOpcode = Opcode | undefined

export class InstructionSet extends Map<string, Opcode> {}

export function loadInstructionSet () : InstructionSet {

    let opcodes = new InstructionSet();

    // ---------------------------------------------------------------------
    // Compile Time Ops
    // ---------------------------------------------------------------------

    opcodes.set('use', (i, op) => {
        //if (!(op instanceof PRAGMA)) throw new Error('Y NO PRAGMA?')
        //console.log("INSTRUCTION", op);
        return op.next
    });

    opcodes.set('declare', (i, op) => {
        if (!(op instanceof DECLARE)) throw new Error('Y NO DECLARE?')
        let cv = newCV(op.declaration);
        let gv = i.executor().root.autovivify(op.config.name);
        assertIsGlob(gv);
        setGlobCode(gv, cv);
        return op.next
    });

    // ---------------------------------------------------------------------
    // Debugging ops
    // ---------------------------------------------------------------------

    opcodes.set('concise', (i, op) => {
        let args = collectArgumentsFromStack(i);

        // FIXME:
        // handle these things better
        // and return errors, instead
        // of calling assert* functions.

        let name = args[0] as Any;
        assertIsPV(name);

        let gv = i.executor().root.autovivify(name.value);
        assertIsGlob(gv);

        let cv = getGlobSlot(gv, GlobSlot.CODE);
        assertIsCV(cv);

        // FIXME: convert this walker * pretty-print
        // function to return a string that we can print
        // instead writing directly to the console
        // see notes in Tools.ts
        walkTraversalOrder(prettyPrinter, cv.contents.leave);

        i.executor().output.write( args );
        return op.next;
    });

    // ---------------------------------------------------------------------
    // Enter/Leave
    // ---------------------------------------------------------------------

    opcodes.set('enter', (i, op) => op.next);
    opcodes.set('leave', (i, op) => op.next);

    opcodes.set('enterscope', (i, op) => { i.enterScope(); return op.next });
    opcodes.set('leavescope', (i, op) => { i.leaveScope(); return op.next });

    opcodes.set('enterloop', (i, op) => op.next);
    opcodes.set('leaveloop', (i, op) => {

        return op.next;
    });

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

    opcodes.set('unstack', (i, op) => (op as BINOP).last);

    opcodes.set('and', (i, op) => {
        let bool = i.stack.pop() as Any;
        assertIsBool(bool);
        if (isTrue(bool) && op instanceof LOGOP) {
            return op.other;
        } else {
            return op.next;
        }
    });

    opcodes.set('or',  (i, op) => {
        let bool = i.stack.pop() as Any;
        assertIsBool(bool);
        if (isFalse(bool) && op instanceof LOGOP) {
            return op.other;
        } else {
            return op.next;
        }
    });

    // ---------------------------------------------------------------------
    // Lists
    // ---------------------------------------------------------------------

    // just leaves everything on the stack ;)
    opcodes.set('list', (i, op) => {
        let args = collectArgumentsFromStack(i);
        i.stack.push(...args);
        return op.next;
    });

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
    // Array/Hash/Code Literals
    // ---------------------------------------------------------------------

    opcodes.set('array_literal', (i, op) => {
        i.stack.push( newAV(collectArgumentsFromStack(i)) );
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

    opcodes.set('padsv_store', (i, op) => {
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
    // Pad AV operations
    // ---------------------------------------------------------------------

    opcodes.set('padav_store', (i, op) => {
        let av = i.stack.pop() as Any;
        assertIsAV(av);
        if (op.config.introduce) {
            i.createLexical(op.config.target.name, av);
        } else {
            i.setLexical(op.config.target.name, av);
        }
        return op.next
    });

    opcodes.set('padav_fetch', (i, op) => {
        let av = i.getLexical(op.config.target.name);
        assertIsAV(av);
        i.stack.push(av);
        return op.next;
    });

    opcodes.set('padav_elem_fetch', (i, op) => {
        let av = i.getLexical(op.config.target.name);
        assertIsAV(av);

        let idx = i.stack.pop() as Any;
        assertIsNumeric(idx);

        // FIXME: Support negative indices
        let elem = av.contents[idx.value];
        if (elem == undefined) elem = SV_Undef;

        i.stack.push(elem);

        return op.next;
    });

    opcodes.set('padav_elem_store', (i, op) => {
        let av = i.getLexical(op.config.target.name);
        assertIsAV(av);

        let elem = i.stack.pop() as Any;
        let idx  = i.stack.pop() as Any;
        assertIsNumeric(idx);

        // FIXME: Support negative indices
        av.contents[idx.value] = elem;

        return op.next;
    });

    // ---------------------------------------------------------------------
    // Builtins
    // ---------------------------------------------------------------------

    // I/O

    opcodes.set('readline', (i, op) => {
        let args = collectArgumentsFromStack(i);
        i.executor().input.read();
        return op.next;
    });

    opcodes.set('print', (i, op) => {
        let args = collectArgumentsFromStack(i);
        i.executor().output.write( args );
        return op.next;
    });

    opcodes.set('say', (i, op) => {
        let args = collectArgumentsFromStack(i);
        i.executor().output.write( args );
        return op.next;
    });


    // strings

    opcodes.set('join', (i, op) => {
        let args = collectArgumentsFromStack(i);

        let sep = args.shift();
        if (sep == undefined) throw new Error('Expected seperator arg for join');
        assertIsPV(sep);
        i.stack.push(
            newPV(
                args.map((sv) => AnytoPV(sv))
                    .flat(1)
                    .map((pv) => pv.value)
                    .join(sep.value)
            )
        );

        return op.next;
    });

    // ---------------------------------------------------------------------
    // Booleans
    // ---------------------------------------------------------------------

    opcodes.set('not', (i, op) => {
        let rhs  = i.stack.pop() as Any;
        assertIsSV(rhs);
        i.stack.push( isTrue(SVtoBool(rhs)) ? SV_False : SV_True );
        return op.next;
    });

    opcodes.set('!', opcodes.get('not') as Opcode);

    opcodes.set('defined', (i, op) => {
        let rhs = i.stack.pop() as Any;
        i.stack.push( isUndef(rhs) ? SV_False : SV_True );
        return op.next;
    });

    // ---------------------------------------------------------------------
    // Strings
    // ---------------------------------------------------------------------

    opcodes.set('lc', LiftStringyUnOp((s) => s.toLowerCase()));
    opcodes.set('uc', LiftStringyUnOp((s) => s.toUpperCase()));

    opcodes.set('concat', LiftStringyBinOp((n, m) => n.concat(m)));

    opcodes.set('.', opcodes.get('concat') as Opcode);

    // ---------------------------------------------------------------------
    // Maths
    // ---------------------------------------------------------------------

    opcodes.set('add',      LiftNumericBinOp((n, m) => n + m));
    opcodes.set('subtract', LiftNumericBinOp((n, m) => n - m));
    opcodes.set('multiply', LiftNumericBinOp((n, m) => n * m));
    opcodes.set('divide',   LiftNumericBinOp((n, m) => n / m));
    opcodes.set('modulus',  LiftNumericBinOp((n, m) => n % m));

    opcodes.set('+', opcodes.get('add')      as Opcode);
    opcodes.set('-', opcodes.get('subtract') as Opcode);
    opcodes.set('*', opcodes.get('multiply') as Opcode);
    opcodes.set('/', opcodes.get('divide')   as Opcode);
    opcodes.set('%', opcodes.get('modulus')  as Opcode);

    // ---------------------------------------------------------------------
    // Eq & Ord
    // ---------------------------------------------------------------------

    opcodes.set('eq', LiftNumericPredicate((n, m) => n == m));
    opcodes.set('ne', LiftNumericPredicate((n, m) => n != m));

    opcodes.set('gt', LiftNumericPredicate((n, m) => n > m));
    opcodes.set('lt', LiftNumericPredicate((n, m) => n < m));

    opcodes.set('ge', LiftNumericPredicate((n, m) => n >= m));
    opcodes.set('le', LiftNumericPredicate((n, m) => n <= m));

    // alias the operation versions ...

    opcodes.set('==', opcodes.get('eq') as Opcode );
    opcodes.set('!=', opcodes.get('ne') as Opcode);

    opcodes.set('>',  opcodes.get('gt') as Opcode);
    opcodes.set('<',  opcodes.get('lt') as Opcode);

    opcodes.set('>=', opcodes.get('ge') as Opcode);
    opcodes.set('<=', opcodes.get('le') as Opcode);

    // ---------------------------------------------------------------------

    return opcodes;
}

// -----------------------------------------------------------------------------
// Subroutine calls
// -----------------------------------------------------------------------------

const PUSHMARK = newPV('*PUSHMARK*');

function collectArgumentsFromStack (i : StackFrame) : Any[] {
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
// Utils to lift some Ops
// -----------------------------------------------------------------------------

function LiftStringyUnOp (f : (s: string) => string) : Opcode {
    return (i, op) => {
        let rhs = i.stack.pop() as Any;
        assertIsStringy(rhs);
        i.stack.push(newPV( f(rhs.value) ));
        return op.next;
    }
}

function LiftStringyBinOp (f : (n: string, m: string) => string) : Opcode {
    return (i, op) => {
        let rhs = i.stack.pop() as Any;
        let lhs = i.stack.pop() as Any;
        assertIsSV(lhs);
        assertIsSV(rhs);
        i.stack.push(newPV( f( SVtoPV(lhs).value, SVtoPV(rhs).value ) ));
        return op.next;
    }
}

function LiftNumericBinOp (f : (n: number, m: number) => number) : Opcode {
    return (i, op) => {
        let rhs = i.stack.pop() as Any;
        let lhs = i.stack.pop() as Any;
        assertIsNumeric(lhs);
        assertIsNumeric(rhs);
        // FIXME: this should not always return an NV
        i.stack.push(newNV( f(lhs.value, rhs.value) ));
        return op.next;
    }
}

function LiftNumericPredicate (f : (n: any, m: any) => boolean) : Opcode {
    // FIXME:
    // This currenly only works for IVs, it should
    // detect if either check the lhs/rhs values at
    // runtime and DWIM, or the compiler should figure
    // it out and use the correct opcode. But this is
    // an MVP, so this is fine for now.
    return (i, op) => {
        let rhs = i.stack.pop() as Any;
        let lhs = i.stack.pop() as Any;
        assertIsComparable(lhs);
        assertIsComparable(rhs);
        i.stack.push( f(lhs.value, rhs.value) ? SV_True : SV_False );
        return op.next;
    }
}

// -----------------------------------------------------------------------------
