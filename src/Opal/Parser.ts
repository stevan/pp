
import { ParserConfig,
         InputSource, SourceStream    } from './Types'
import { Tokenizer,   TokenStream     } from './Parser/Tokenizer'
import { Lexer,       LexedStream     } from './Parser/Lexer'
import { TreeParser,  ParseTreeStream } from './Parser/TreeParser'
import { ASTBuilder,  ASTNodeStream   } from './Parser/ASTBuilder'

import * as AST from './Parser/AST'

// FIXME: dont forget
export type { ASTNodeStream } from './Parser/ASTBuilder'

export class Parser {
    public config     : ParserConfig;
    public tokenizer  : Tokenizer;
    public lexer      : Lexer;
    public treeParser : TreeParser;
    public builder    : ASTBuilder;

    constructor(config : ParserConfig = {}) {
        this.config      = config;
        this.tokenizer   = new Tokenizer();
        this.lexer       = new Lexer();
        this.treeParser  = new TreeParser();
        this.builder     = new ASTBuilder();
    }

    async *run (source : SourceStream) : ASTNodeStream {
        for await (const node of
            this.builder.run(
            this.treeParser.run(
            this.lexer.run(
            this.tokenizer.run(
                source
        ))))){
            let statement = node as AST.Statement;
            if (statement.body instanceof AST.Pragma) {
                let pragma = statement.body as AST.Pragma;
                pragma.resolver = (input) => this.parse(input);
            }
            yield statement;
        }
    }



    async parse (input : InputSource) : Promise<AST.Program> {
        return new Promise<AST.Program>(async (resolve, reject) => {
            let program = new AST.Program([]);

            for await (const node of this.run(input.run())) {
                let statement = node as AST.Statement;
                if (statement.body instanceof AST.Pragma) {
                    program.pragmas.push(statement.body);
                }
                program.statements.push(statement);
            }

            resolve(program);
        });
    }
}
