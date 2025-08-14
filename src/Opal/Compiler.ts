

import { CompilerConfig } from './Types'

import { OpTreeEmitter } from './Compiler/OpTreeEmitter'
import { OpTree, OP, UNOP, LOGOP, MaybeOP, PRAGMA } from './Runtime/API'

import * as AST          from './Parser/AST'
import { ASTNodeStream } from './Parser'

import { CompilationUnit } from './Compiler/CompilationUnit'

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

    compileStream (fragment : AST.Fragment) : OpTree {
        let optree = fragment.accept(this.emitter);
        return optree;
    }

    compile (program : AST.Program) : CompilationUnit {
        let optree = program.accept(this.emitter);
        let unit   = new CompilationUnit( optree );
        return unit;
    }
}
