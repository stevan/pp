import {
    logger,
    SourceStream,
    prettyPrinter,
    walkExecOrder,
    walkTraversalOrder,
} from './Tools'

import {
    prettyPrintParseTree
} from './Tester/ParserTestRunner'

import { Tokenizer }   from './Parser/Tokenizer'
import { Lexer }       from './Parser/Lexer'
import { TreeParser }  from './Parser/TreeParser'
import * as AST        from './Parser/AST'
import { Parser }      from './Parser'
import { Compiler }    from './Compiler'
import { Interpreter } from './Interpreter'

import { Statement } from './Parser/AST'

export class Opal {
    private tokenizer   : Tokenizer;
    private lexer       : Lexer;
    private treeParser  : TreeParser;
    private parser      : Parser;
    private compiler    : Compiler;
    private interpreter : Interpreter;

    private isVerbose   : boolean;
    private isQuiet     : boolean;

    constructor(config: any = {}) {
        this.isVerbose = config.verbose ?? false;
        this.isQuiet   = config.quiet   ?? this.isVerbose;

        this.tokenizer   = new Tokenizer();
        this.lexer       = new Lexer();
        this.treeParser  = new TreeParser();
        this.parser      = new Parser();
        this.compiler    = new Compiler();
        this.interpreter = new Interpreter({
            DEBUG : this.isVerbose,
            QUIET : this.isQuiet,
        });
    }

    run(src: string[]): Interpreter {
        let source = SourceStream(src);

        let statementCount = 0;

        let program = new AST.Program([]);

        if (this.isVerbose) {
            logger.log("=".repeat(process.stdout.columns - 1));
            logger.log('Source');
            logger.log("=".repeat(process.stdout.columns - 1));

            src.forEach((s) => logger.log(s));

            logger.log("=".repeat(process.stdout.columns - 1));
            logger.log('Parser');
            logger.log("=".repeat(process.stdout.columns - 1));
        }

        if (!this.isQuiet) logger.time('\x1b[31m... total\x1b[0m');

        if (!this.isQuiet) logger.time('\x1b[35m... parse time\x1b[0m');
        for (const parseTree of this.treeParser.run(this.lexer.run(this.tokenizer.run(source)))) {

            if (this.isVerbose) {
                logger.group(
                    `\x1b[42m  Statement (${statementCount.toString().padStart(3, '0')}):` +
                    " ".repeat(process.stdout.columns - 19) + "\x1b[0m");
                logger.group(`\x1b[45m  ParseTree:` + " ".repeat(process.stdout.columns - 14) + "\x1b[0m");
                logger.log('\n', prettyPrintParseTree(parseTree));
                logger.groupEnd()
            }

            statementCount++;

            let node = this.parser.parse(parseTree);
            program.statements.push(node as Statement);

            if (this.isVerbose) {
                logger.group(`\x1b[43m  AST:` + " ".repeat(process.stdout.columns - 8) + "\x1b[0m");
                logger.log('\n', node, '\n');
                logger.groupEnd();

                logger.group(`\x1b[44m  Deparse:` + " ".repeat(process.stdout.columns - 12) + "\x1b[0m");
                logger.log('\n' + node.deparse(), '\n');
                logger.groupEnd();

                logger.groupEnd();
            }
        }
        if (!this.isQuiet) logger.timeEnd('\x1b[35m... parse time\x1b[0m');

        if (this.isVerbose) {
            logger.log("=".repeat(process.stdout.columns - 1));
            logger.log('Compiler');
            logger.log("=".repeat(process.stdout.columns - 1));
        }

        if (!this.isQuiet) logger.time('\x1b[34m... compile time\x1b[0m');
        let opcodes = this.compiler.compile(program);
        if (!this.isQuiet) logger.timeEnd('\x1b[34m... compile time\x1b[0m');

        if (this.isVerbose) {
            logger.group('EXEC ORDER:');
            walkExecOrder(prettyPrinter, opcodes.enter);
            logger.groupEnd();

            logger.group('TREE ORDER:');
            walkTraversalOrder(prettyPrinter, opcodes.leave);
            logger.groupEnd();

            logger.log("=".repeat(process.stdout.columns - 1));
            logger.log('Interpreter');
            logger.log("=".repeat(process.stdout.columns - 1));
        }

        if (!this.isQuiet) logger.time('\x1b[36m... runtime\x1b[0m');
        this.interpreter.run(opcodes);
        if (!this.isQuiet) logger.timeEnd('\x1b[36m... runtime\x1b[0m');

        if (this.isVerbose) {
            logger.log("=".repeat(process.stdout.columns - 1));
        }

        if (!this.isQuiet) logger.timeEnd('\x1b[31m... total\x1b[0m');

        return this.interpreter;
    }
}
