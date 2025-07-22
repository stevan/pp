
import { logger, walkTraversalOrder } from './Tools'

import { Program } from './Parser/AST'
import {
    OP, COP, UNOP, BINOP, LOGOP, LISTOP,
    MaybeOP, OpTree, InstructionSet
} from './Runtime/API'

import { loadInstructionSet } from './Compiler/InstructionSet'

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
