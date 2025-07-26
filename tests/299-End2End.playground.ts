
import {
    logger,
    SourceStream,
    prettyPrinter,
    walkExecOrder,
    walkTraversalOrder,
} from '../src/Tools'

import {
    prettyPrintParseTree
} from '../src/Tester/ParserTestRunner'

import { Tokenizer }   from '../src/Parser/Tokenizer'
import { Lexer }       from '../src/Parser/Lexer'
import { TreeParser }  from '../src/Parser/TreeParser'
import * as AST        from '../src/Parser/AST'
import { Parser }      from '../src/Parser'
import { Compiler }    from '../src/Compiler'
import { Interpreter } from '../src/Interpreter'

import { Node, Statement } from '../src/Parser/AST'

let $SOURCE = `

my $foo = 1 + 2;
my $bar = $foo * (10 - 100);

`;

let source = SourceStream([$SOURCE]);

let tokenizer   = new Tokenizer();
let lexer       = new Lexer();
let treeParser  = new TreeParser();
let parser      = new Parser();
let compiler    = new Compiler();
let interpreter = new Interpreter({ DEBUG : true });

let trees   = [];
let program = new AST.Program([]);

logger.log("=".repeat(process.stdout.columns - 1));
logger.log('Source');
logger.log("=".repeat(process.stdout.columns - 1));

logger.log($SOURCE);

logger.log("=".repeat(process.stdout.columns - 1));
logger.log('Parser');
logger.log("=".repeat(process.stdout.columns - 1));

for (const parseTree of treeParser.run(lexer.run(tokenizer.run(source)))) {
    logger.group(`Statement (${trees.length.toString().padStart(3, '0')}):`);
    logger.group(`ParseTree:`);
    logger.log(prettyPrintParseTree(parseTree));
    logger.groupEnd()

    trees.push(parseTree);

    let node = parser.parse(parseTree);

    program.statements.push(node as Statement);

    logger.group(`AST:`);
    logger.log(node, '\n');
    logger.groupEnd();

    logger.group(`Deparse:`);
    logger.log(node.deparse(), '\n');
    logger.groupEnd();

    logger.groupEnd();
}

logger.log("=".repeat(process.stdout.columns - 1));
logger.log('Compilier');
logger.log("=".repeat(process.stdout.columns - 1));
let opcodes = compiler.compile(program);

logger.group('EXEC ORDER:');
walkExecOrder(prettyPrinter, opcodes.enter);
logger.groupEnd();

logger.group('TREE ORDER:');
walkTraversalOrder(prettyPrinter, opcodes.leave);
logger.groupEnd();

logger.log("=".repeat(process.stdout.columns - 1));
logger.log('Interpreter');
logger.log("=".repeat(process.stdout.columns - 1));

interpreter.run(opcodes);

logger.log("=".repeat(process.stdout.columns - 1));


