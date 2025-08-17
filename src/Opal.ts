
import { inspect } from "node:util"

import {
    monitorLog,
    prettyPrinter,
} from './Opal/Tools'

import {
    InputStream,
    OutputStream,

    InputSource,
    OutputSink,

    RuntimeConfig,
} from './Opal/Types'

import { Parser,     ASTNodeStream   } from './Opal/Parser'
import { Compiler,   OpTreeStream    } from './Opal/Compiler'

import { REPL }          from './Opal/Input/REPL'
import { Interpreter, defaultRuntimeConfig }   from './Opal/Interpreter'
import { ConsoleOutput } from './Opal/Output/ConsoleOutput'

export class Opal {
    private input       : InputSource;
    private parser      : Parser;
    private compiler    : Compiler;
    private interpreter : Interpreter;
    private output      : OutputSink;

    constructor(config: RuntimeConfig = defaultRuntimeConfig) {
        this.input       = new REPL();
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
                        this.input.run()
                    )
                )
            )
        )
    }

    /*

    async monitor () : Promise<void> {
        return this.output.run(
            this.monitorOutputStream(this.interpreter.run(
                this.monitorOpTreeStreamStream(this.compiler.run(
                    this.monitorASTNodeStream(this.parser.run(
                        this.monitorParseTreeStream(this.treeParser.run(
                            this.monitorLexedStream(this.lexer.run(
                                this.monitorTokenStream(this.tokenizer.run(
                                    this.monitorInputStream(this.input.run())
                                ))
                            ))
                        ))
                    ))
                ))
            ))
        )
    }

    async *monitorOutputStream (source: OutputStream) : OutputStream {
        let label = '*OUTPUT*';
        for await (const src of source) {
            monitorLog.group(`<${label}> ╰───╮`);
            monitorLog.log(`  ${label} : ${inspect(src, false, null, true)}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ╭───╯`);
        }
    }

    async *monitorOpTreeStreamStream (source: OpTreeStream) : OpTreeStream {
        let label = 'COMPILER';
        for await (const src of source) {
            monitorLog.group(`<${label}> ╰───╮`);
            monitorLog.log(`  ${label} ${inspect(src.enter, false, null, true).replace(/\n/g, "\n           ")}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ╭───╯`);
        }
    }

    async *monitorASTNodeStream (source: ASTNodeStream) : ASTNodeStream {
        let label = 'AST-NODE';
        for await (const src of source) {
            monitorLog.group(`<${label}> ╰───╮`);
            monitorLog.log(`  ${label} ${inspect(src, false, null, true).replace(/\n/g, "\n           ")}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ╭───╯`);
        }
    }

    async *monitorParseTreeStream (source: ParseTreeStream) : ParseTreeStream {
        let label = 'EXPRTREE';
        for await (const src of source) {
            monitorLog.group(`<${label}> ╰───╮`);
            monitorLog.log(`  ${label} ${inspect(src, false, null, true).replace(/\n/g, "\n           ")}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ╭───╯`);
        }
    }

    async *monitorLexedStream (source: LexedStream) : LexedStream {
        let label = 'LEX-ANAL';
        for await (const src of source) {
            monitorLog.group(`<${label}> ╰───╮`);
            monitorLog.log(`  ${label} : ${inspect(src, false, null, true)}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ╭───╯`);
        }
    }

    async *monitorTokenStream (source: TokenStream) : TokenStream {
        let label = 'TOKENIZE';
        for await (const src of source) {
            monitorLog.group(`<${label}> ╰───╮`);
            monitorLog.log(`  ${label} : ${inspect(src, false, null, true)}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ╭───╯`);
        }
    }

    async *monitorInputStream (source: InputStream) : InputStream {
        let label = '*SOURCE*';
        for await (const src of source) {
            monitorLog.group(`<${label}> ▶───╮`);
            monitorLog.log(`  ${label} : ${inspect(src, false, null, true)}`);
            yield src;
            monitorLog.groupEnd();
            monitorLog.log(  `<${label}> ◀───╯`);
        }
    }
    */
}
