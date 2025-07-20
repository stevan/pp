
import { logger } from './Logger'

import { Program } from './AST'
import {
    OP, COP, UNOP, BINOP, LOGOP, LISTOP,
    MaybeOP, OpTree
} from './Runtime'

import { InstructionSet }     from './Runtime'
import { loadInstructionSet } from './InstructionSet'

export function walkExecOrder(f : (o : OP, d : number) => void, op : OP, depth : number = 0) {
    while (op != undefined) {
        f(op, depth);

        if (op.name == 'goto' && depth > 0) return;

        if (op instanceof LOGOP && op.other) {
            walkExecOrder(f, op.other, depth + 1);
        }

        if (op.next == undefined) return;
        op = op.next;
    }
}

export function walkTraversalOrder(f : (o : OP, d : number) => void, op : OP, depth : number = 0) {
    f(op, depth);
    if (op instanceof UNOP) {
        for (let k : MaybeOP = op.first; k != undefined; k = k.sibling) {
            walkTraversalOrder(f, k, depth + 1);
        }
    }
}

export class Compiler {
    public opcodes : InstructionSet;

    constructor () {
        this.opcodes = loadInstructionSet();
    }

    compile (program : Program) : OpTree {

        let uid_seq = 0;

        let prog = program.emit();

        // link the OPs and Opcodes
        walkTraversalOrder(
            (op, d) => {
                let opcode = this.opcodes.get(op.name);
                if (opcode == undefined) throw new Error(`Unable to find opcode(${op.name})`);
                op.metadata.uid             = ++uid_seq;
                op.metadata.compiler.opcode = opcode;
            },
            prog.leave
        );

        return prog;
    }
}
