import {
    logger,
    prettyPrinter,
    walkExecOrder,
    walkTraversalOrder,
} from './Tools'

import {
    SourceStream,
    OutputStream,

    InputSource,
    OutputSink,

    RuntimeConfig,
} from './Types'

import { REPL }          from './REPL'
import { Tokenizer }     from './Parser/Tokenizer'
import { Lexer }         from './Parser/Lexer'
import { TreeParser }    from './Parser/TreeParser'
import { Parser }        from './Parser'
import { Compiler }      from './Compiler'
import { Interpreter }   from './Interpreter'
import { ConsoleOutput } from './ConsoleOutput'

import * as AST        from './Parser/AST'
import { StackFrame }  from './Runtime'

export class Opal {
    private input       : InputSource;
    private tokenizer   : Tokenizer;
    private lexer       : Lexer;
    private treeParser  : TreeParser;
    private parser      : Parser;
    private compiler    : Compiler;
    private interpreter : Interpreter;
    private output      : OutputSink;

    constructor(config: RuntimeConfig = {}) {
        this.input       = new REPL();
        this.tokenizer   = new Tokenizer();
        this.lexer       = new Lexer();
        this.treeParser  = new TreeParser();
        this.parser      = new Parser();
        this.compiler    = new Compiler();
        this.interpreter = new Interpreter(config);
        this.output      = new ConsoleOutput();
    }

    async run () : Promise<void> {
        return this.output.run(
            this.interpreter.run(
                this.compiler.run(
                    this.parser.run(
                        this.treeParser.run(
                            this.lexer.run(
                                this.tokenizer.run(
                                    this.input.run()
                                )
                            )
                        )
                    )
                )
            )
        )
    }
}
