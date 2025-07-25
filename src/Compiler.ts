
import { logger, walkTraversalOrder } from './Tools'

import { Program } from './Parser/AST'
import {
    OP, COP, UNOP, BINOP, LOGOP, LISTOP,
    MaybeOP, OpTree
} from './Runtime/API'

import { InstructionSet, loadInstructionSet } from './Compiler/InstructionSet'
import { OpTreeEmitter } from './Compiler/OpTreeEmitter'

export class Compiler {
    public opcodes : InstructionSet;
    public emitter : OpTreeEmitter;

    constructor () {
        this.emitter = new OpTreeEmitter();
        this.opcodes = loadInstructionSet();
    }

    compile (program : Program) : OpTree {
        let prog = program.accept(this.emitter);

        let uid_seq = 0;

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
