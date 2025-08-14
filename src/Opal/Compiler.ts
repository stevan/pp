

import { CompilerConfig } from './Types'

import { OpTreeEmitter } from './Compiler/OpTreeEmitter'
import { walkTraversalOrder } from './Compiler/OpTreeWalker'
import { OpTree, OP, UNOP, LOGOP, MaybeOP, PRAGMA } from './Runtime/API'

import * as AST          from './Parser/AST'
import { ASTNodeStream } from './Parser'

// -----------------------------------------------------------------------------

export type OpTreeStream = AsyncGenerator<OpTree, void, void>;

export class Compiler {
    public config  : CompilerConfig;
    public emitter : OpTreeEmitter;

    constructor (config : CompilerConfig = {}) {
        this.config  = config;
        this.emitter = new OpTreeEmitter();
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

    private finalizeOpTree (optree: OpTree) : OpTree {
        let uid_seq = 0;

        // link the OPs and Opcodes
        walkTraversalOrder(
            (op, d) => {
                op.metadata.uid = ++uid_seq;
                if (op instanceof PRAGMA) {
                    let nonfinal = op.resolver;
                    op.resolver = (src) => nonfinal(src).then((ot) => this.finalizeOpTree(ot));
                    optree.pragmas.push(op);
                }
            },
            optree.leave
        );

        return optree;
    }

    // NOTE:
    // these two are identical for now, but we may want
    // to do something different later on, we I am going
    // to leave them here for now.

    compileStream (fragment : AST.Fragment) : OpTree {
        let optree = fragment.accept(this.emitter);
        return this.finalizeOpTree(optree);
    }

    compile (program : AST.Program) : OpTree {
        let optree = program.accept(this.emitter);
        return this.finalizeOpTree(optree);
    }
}
