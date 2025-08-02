
import { walkTraversalOrder } from './Tools'

import { CompilerConfig } from './Types'
import { Program } from './Parser/AST'
import {
    OpTree
} from './Runtime/API'

import { InstructionSet, loadInstructionSet } from './Compiler/InstructionSet'
import { OpTreeEmitter } from './Compiler/OpTreeEmitter'

export class Compiler {
    public config  : CompilerConfig;
    public opcodes : InstructionSet;
    public emitter : OpTreeEmitter;

    constructor (config : CompilerConfig = {}) {
        this.config  = config;
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
