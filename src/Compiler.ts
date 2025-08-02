
import { walkTraversalOrder } from './Tools'

import { CompilerConfig } from './Types'

import { InstructionSet, loadInstructionSet } from './Compiler/InstructionSet'
import { OpTreeEmitter } from './Compiler/OpTreeEmitter'
import { OpTree } from './Runtime/API'

import * as AST          from './Parser/AST'
import { ASTNodeStream } from './Parser'

export type OpTreeStream = AsyncGenerator<OpTree, void, void>;

export class Compiler {
    public config  : CompilerConfig;
    public opcodes : InstructionSet;
    public emitter : OpTreeEmitter;

    constructor (config : CompilerConfig = {}) {
        this.config  = config;
        this.emitter = new OpTreeEmitter();
        this.opcodes = loadInstructionSet();
    }

    async *run (source : ASTNodeStream) : OpTreeStream {
        for await (const node of source) {
            switch (true) {
            case (node instanceof AST.Program):
                yield this.compile(node);
                break;
            case (node instanceof AST.Statement):
                yield this.compile(new AST.Program([node]));
                break;
            case (node instanceof AST.EmptyStatement):
                // do nothing, just wait for the next one
                break;
            default:
                throw new Error(`Unexpected Node ${node.kind}`)
            }
        }
    }

    compile (program : AST.Program) : OpTree {
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
