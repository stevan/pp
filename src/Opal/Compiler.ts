

import { CompilerConfig } from './Types'

import { InstructionSet, loadInstructionSet } from './Compiler/InstructionSet'
import { OpTreeEmitter } from './Compiler/OpTreeEmitter'
import { OpTree, OP, UNOP, LOGOP, MaybeOP } from './Runtime/API'

import * as AST          from './Parser/AST'
import { ASTNodeStream } from './Parser'

import { CompilationUnit } from './Compiler/CompilationUnit'

import { walkTraversalOrder, walkExecOrder } from './Compiler/OpTreeWalker'

// -----------------------------------------------------------------------------

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
            case (node instanceof AST.Statement):
                yield this.compileStream(new AST.Fragment([node]));
                break;
            case (node instanceof AST.EmptyStatement):
                // do nothing, just wait for the next one
                break;
            default:
                throw new Error(`Unexpected Node ${node.kind}`)
            }
        }
    }

    compileStream (fragment : AST.Fragment) : OpTree {
        let optree = fragment.accept(this.emitter);

        let uid_seq = 0;

        // link the OPs and Opcodes
        walkTraversalOrder(
            (op, d) => {
                let opcode = this.opcodes.get(op.name);
                if (opcode == undefined) throw new Error(`Unable to find opcode(${op.name})`);
                op.metadata.uid             = ++uid_seq;
                op.metadata.compiler.opcode = opcode;
            },
            optree.leave
        );

        return optree;
    }

    compile (program : AST.Program) : CompilationUnit {
        let optree = program.accept(this.emitter);
        let unit   = new CompilationUnit( optree );
        return unit;
    }
}
