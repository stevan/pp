
import { logger } from './Tools'

import { ParseTree, ExpressionKind } from './Parser/TreeParser'

import * as AST from './Parser/AST'
import {
    Node,
    Assignment,
    Identifier,
} from './Parser/AST'

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

export class Parser {

    parse (parseTree: ParseTree) : Node {
        return visitParseTree(parseTree, (tree, children, depth) => { return this.buildAST(tree, children, depth) });
    }

    buildAST(tree : ParseTree, children : Node[], depth : number) : Node {
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
                switch (tree.value.token.source.charAt(0)) {
                case '$':
                    return new AST.ScalarFetch(tree.value.token.source.slice(1))
                case '@':
                    return new AST.ArrayFetch(tree.value.token.source.slice(1))
                case '%':
                case '&':
                case '*':
                    throw new Error('TODO - fetch for % & and *');
                default:
                    throw new Error(`Unrecognized Identifier Sigil ${JSON.stringify(tree.value.token.source)}`);
                }
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
            // Assignment
            // -----------------------------------------------------------------
            case 'my':
                if (children.length == 1) {
                    let operand = children[0] as Node;

                    if (operand instanceof AST.ScalarStore) {
                        return new AST.ScalarDeclare(operand.name, operand.value);
                    }
                    else if (operand instanceof AST.ArrayStore) {
                        throw new Error('FIXME - this will not work properly')
                        //return new AST.ArrayDeclare(operand.name, [operand.value]);
                    }
                    else {
                        throw new Error('TODO - support assignment for Hashes, Code and Globs(?)')
                    }
                } else {
                    throw new Error(`Expected one operands for my() and got ${JSON.stringify(children)}`)
                }
            case 'our':
                throw new Error('TODO - glob assignment');
            case '=':
                if (children.length == 2) {
                    let lhs = children[0] as Node;
                    let rhs = children[1] as Node;

                    if (lhs instanceof AST.ScalarFetch) {
                        return new AST.ScalarStore(lhs.name, rhs);
                    }
                    else if (lhs instanceof AST.ArrayFetch) {
                        return new AST.ArrayStore(lhs.name, rhs);
                    }
                    else {
                        throw new Error('TODO - support assignment for Hashes, Code and Globs(?)')
                    }
                } else {
                    throw new Error(`Expected two operands for assignement(=) and got ${JSON.stringify(children)}`)
                }
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
            switch (tree.kind) {
            case ExpressionKind.BARE:
                throw new Error('This should never actually happen, the BARE kind is internal');
            case ExpressionKind.STATEMENT:
                if (children.length == 1) {
                    return new AST.Statement(children[0] as Node);
                } else {
                    throw new Error('TODO');
                }
            case ExpressionKind.CONTROL:
                throw new Error('TODO');
            case ExpressionKind.PARENS:
            case ExpressionKind.SQUARE:
            case ExpressionKind.CURLY:
                throw new Error('TODO');
            default:
                throw new Error(`Unrecognized Expression ${JSON.stringify(tree)}`);
            }
        default:
            throw new Error(`Unknown ParseTree type ${JSON.stringify(tree)}`);
        }
    }

}
