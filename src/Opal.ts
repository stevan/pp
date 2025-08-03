import {
    logger,
    prettyPrinter,
} from './Opal/Tools'

import {
    SourceStream,
    OutputStream,

    InputSource,
    OutputSink,

    RuntimeConfig,
} from './Opal/Types'

import { REPL }          from './Opal/Input/REPL'
import { Tokenizer }     from './Opal/Parser/Tokenizer'
import { Lexer }         from './Opal/Parser/Lexer'
import { TreeParser }    from './Opal/Parser/TreeParser'
import { Parser }        from './Opal/Parser'
import { Compiler, walkTraversalOrder } from './Opal/Compiler'
import { Interpreter }   from './Opal/Interpreter'
import { ConsoleOutput } from './Opal/Output/ConsoleOutput'

import * as AST        from './Opal/Parser/AST'
import { StackFrame }  from './Opal/Runtime'

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
