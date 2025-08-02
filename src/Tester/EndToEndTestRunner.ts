
import {
    logger,
    SourceStream,
    prettyPrinter,
    walkExecOrder,
    walkTraversalOrder,
} from '../Tools'

import {
    prettyPrintParseTree
} from './ParserTestRunner'

import { Tokenizer }   from '../Parser/Tokenizer'
import { Lexer }       from '../Parser/Lexer'
import { TreeParser }  from '../Parser/TreeParser'
import * as AST        from '../Parser/AST'
import { Parser }      from '../Parser'
import { Compiler }    from '../Compiler'
import { Interpreter } from '../Interpreter'

import { Node, Statement } from '../Parser/AST'

/**
 * Provides a simple, end-to-end interface for running code through the entire pipeline.
 * It takes source code as input and handles tokenizing, lexing, parsing, compiling,
 * and interpreting the code.
 *
 * @param {string[]} src - An array of strings, where each string is a line of source code.
 * @param {object} config - A configuration object.
 * @param {boolean} [config.verbose=false] - If true, logs detailed information about each stage of the pipeline.
 * @param {boolean} [config.quiet=false] - If true, suppresses all logging output, including timing information.
 * @returns {Interpreter} The interpreter instance after the code has been executed. This can be inspected to check the final state, such as the contents of STDOUT.
 */
export function EndToEndTestRunner (src : string[], config : any) : Interpreter {
    let isVerbose   = config.verbose ?? false;
    let isQuiet     = config.quiet   ?? isVerbose;

    let source      = SourceStream(src);
    let tokenizer   = new Tokenizer();
    let lexer       = new Lexer();
    let treeParser  = new TreeParser();
    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter({
        DEBUG : isVerbose,
        QUIET : isQuiet,
    });

    let statementCount = 0;

    let program = new AST.Program([]);

    if (isVerbose) {
        logger.log("=".repeat(process.stdout.columns - 1));
        logger.log('Source');
        logger.log("=".repeat(process.stdout.columns - 1));

        src.forEach((s) => logger.log(s));

        logger.log("=".repeat(process.stdout.columns - 1));
        logger.log('Parser');
        logger.log("=".repeat(process.stdout.columns - 1));
    }

    if (!isQuiet) logger.time('\x1b[31m... total\x1b[0m');

    if (!isQuiet) logger.time('\x1b[35m... parse time\x1b[0m');
    for (const parseTree of treeParser.run(lexer.run(tokenizer.run(source)))) {

        if (isVerbose) {
            logger.group(
                `\x1b[42m  Statement (${statementCount.toString().padStart(3, '0')}):` +
                " ".repeat(process.stdout.columns - 19) + "\x1b[0m");
            logger.group(`\x1b[45m  ParseTree:` + " ".repeat(process.stdout.columns - 14) + "\x1b[0m");
            logger.log('\n', prettyPrintParseTree(parseTree));
            logger.groupEnd()
        }

        statementCount++;

        let node = parser.parse(parseTree);
        program.statements.push(node as Statement);

        if (isVerbose) {
            logger.group(`\x1b[43m  AST:` + " ".repeat(process.stdout.columns - 8) + "\x1b[0m");
            logger.log('\n', node, '\n');
            logger.groupEnd();

            logger.group(`\x1b[44m  Deparse:` + " ".repeat(process.stdout.columns - 12) + "\x1b[0m");
            logger.log('\n' + node.deparse(), '\n');
            logger.groupEnd();

            logger.groupEnd();
        }
    }
    if (!isQuiet) logger.timeEnd('\x1b[35m... parse time\x1b[0m');

    if (isVerbose) {
        logger.log("=".repeat(process.stdout.columns - 1));
        logger.log('Compiler');
        logger.log("=".repeat(process.stdout.columns - 1));
    }

    if (!isQuiet) logger.time('\x1b[34m... compile time\x1b[0m');
    let opcodes = compiler.compile(program);
    if (!isQuiet) logger.timeEnd('\x1b[34m... compile time\x1b[0m');

    if (isVerbose) {
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

    if (!isQuiet) logger.time('\x1b[36m... runtime\x1b[0m');
    interpreter.run(opcodes);
    if (!isQuiet) logger.timeEnd('\x1b[36m... runtime\x1b[0m');

    if (isVerbose) {
        logger.log("=".repeat(process.stdout.columns - 1));
    }

    if (!isQuiet) logger.timeEnd('\x1b[31m... total\x1b[0m');

    return interpreter;
}
