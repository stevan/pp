
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

    for (const parseTree of treeParser.run(lexer.run(tokenizer.run(source)))) {

        if (isVerbose) {
            logger.group(`Statement (${statementCount.toString().padStart(3, '0')}):`);
            logger.group(`ParseTree:`);
            logger.log("-".repeat(process.stdout.columns - 3));
            logger.log(prettyPrintParseTree(parseTree));
            logger.groupEnd()
        }

        statementCount++;

        let node = parser.parse(parseTree);
        program.statements.push(node as Statement);

        if (isVerbose) {
            logger.group(`AST:`);
            logger.log(node, '\n');
            logger.groupEnd();

            logger.group(`Deparse:`);
            logger.log(node.deparse(), '\n');
            logger.groupEnd();

            logger.groupEnd();
        }
    }

    if (isVerbose) {
        logger.log("=".repeat(process.stdout.columns - 1));
        logger.log('Compilier');
        logger.log("=".repeat(process.stdout.columns - 1));
    }

    let opcodes = compiler.compile(program);

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

    interpreter.run(opcodes);

    if (isVerbose) {
        logger.log("=".repeat(process.stdout.columns - 1));
    }

    return interpreter;
}
