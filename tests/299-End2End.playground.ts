
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
import * as AST        from '../src/Parser/AST'
import { Compiler }    from '../src/Compiler'
import { Interpreter } from '../src/Interpreter'

import {
    TreeParser,
    ParseTree,
    ExpressionKind,
} from '../src/Parser/TreeParser'

import type { Node, Statement } from '../src/Parser/AST'



// -----------------------------------------------------------------------------

export type ParseTreeVisitor = (tree: ParseTree, children: Node[], depth : number) => Node;

export function visitParseTree (tree: ParseTree, visitor: ParseTreeVisitor, depth : number = 0) : Node {
    switch (tree.type) {
    case 'TERM':
        return visitor(tree, [], depth);
    case 'SLICE':
        return visitor(tree, [
            visitParseTree(tree.value, visitor, depth + 1),
            visitParseTree(tree.slice, visitor, depth + 1)
        ], depth);
    case 'OPERATION':
        return visitor(tree,
            tree.operands.map((t) => visitParseTree(t, visitor, depth + 1)),
            depth
        );
    case 'EXPRESSION':
        return visitor(tree,
            tree.stack.map((t) => visitParseTree(t, visitor, depth + 1)),
            depth
        );
    default:
        throw new Error(`Unknown ParseTree type ${JSON.stringify(tree)}`);
    }
}


// -----------------------------------------------------------------------------

let $SOURCE = `

1 + 2;
3 * 5;

`;

let source = SourceStream([$SOURCE]);

let tokenizer   = new Tokenizer();
let lexer       = new Lexer();
let treeParser  = new TreeParser();
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

    let node = visitParseTree(parseTree, (tree, children, depth) : Node => {
        switch (tree.type) {
        case 'TERM':
            // handle different term types
            switch (tree.value.type) {
            case 'LITERAL':
                // Look for literal tokens ...
                switch (tree.value.token.type) {
                case 'STRING':
                    return new AST.ConstStr(tree.value.token.source);
                case 'NUMBER':
                    if (tree.value.token.source.indexOf('.') != -1) {
                        return new AST.ConstNumber(Number.parseFloat(tree.value.token.source));
                    } else {
                        return new AST.ConstInt(Number.parseInt(tree.value.token.source));
                    }
                case 'ATOM':
                    // look for literal ATOM tokens
                    switch (tree.value.token.source) {
                    case 'undef':
                        return new AST.ConstUndef();
                    case 'true':
                        return new AST.ConstTrue();
                    case 'false':
                        return new AST.ConstFalse();
                    default:
                        throw new Error(`Unrecognized Literal ATOM Token ${JSON.stringify(tree.value.token)}`);
                    }
                default:
                    throw new Error(`Unrecognized Literal Token ${JSON.stringify(tree.value.token)}`);
                }
            case 'IDENTIFIER':
                return new AST.Identifier(tree.value.token.source)
            case 'BAREWORD':
            case 'KEYWORD':
                throw new Error('TODO');
            default:
                throw new Error(`Unrecognized Term Value ${JSON.stringify(tree.value)}`);
            }
        case 'SLICE':
            throw new Error('TODO');
        case 'OPERATION':
            switch (tree.operator.token.source) {
            // -----------------------------------------------------------------
            // Math
            // -----------------------------------------------------------------
            case '+':
                return new AST.Add(children[0] as Node, children[1] as Node);
            case '-':
                return new AST.Subtract(children[0] as Node, children[1] as Node);
            case '*':
                return new AST.Multiply(children[0] as Node, children[1] as Node);
            case '/':
                return new AST.Modulus(children[0] as Node, children[1] as Node);
            case '%':
                return new AST.Modulus(children[0] as Node, children[1] as Node);
            // -----------------------------------------------------------------
            // Equality
            // -----------------------------------------------------------------
            case '==':
                return new AST.Equal(children[0] as Node, children[1] as Node);
            case '!=':
                return new AST.NotEqual(children[0] as Node, children[1] as Node);
            // -----------------------------------------------------------------
            // Ordering
            // -----------------------------------------------------------------
            case '<':
                return new AST.LessThan(children[0] as Node, children[1] as Node);
            case '>':
                return new AST.GreaterThan(children[0] as Node, children[1] as Node);
            case '<=':
                return new AST.LessThanOrEqual(children[0] as Node, children[1] as Node);
            case '>=':
                return new AST.GreaterThanOrEqual(children[0] as Node, children[1] as Node);
            // -----------------------------------------------------------------
            default:
                throw new Error(`Unrecognized Operator ${JSON.stringify(tree.operator)}`);
            }
        case 'EXPRESSION':
            return new AST.Statement(children[0] as Node);
        default:
            throw new Error(`Unknown ParseTree type ${JSON.stringify(tree)}`);
        }
    });

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


