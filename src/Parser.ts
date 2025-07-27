
import { logger } from './Tools'

import { ParseTree, ExpressionKind } from './Parser/TreeParser'

import * as AST from './Parser/AST'
import { Node } from './Parser/AST'

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

export class ParserError extends AST.AbstractNode {
    override kind : AST.NodeKind = AST.NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public args : Node[],
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `ErrorNode(${this.msg})`;
    }
}

export class TODO extends AST.AbstractNode {
    override kind : AST.NodeKind = AST.NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `TODO(${this.msg})`;
    }
}

export class FIXME extends AST.AbstractNode {
    override kind : AST.NodeKind = AST.NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `FIXME(${this.msg})`;
    }
}


export class HMMM extends AST.AbstractNode {
    override kind : AST.NodeKind = AST.NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `HMMM(${this.msg})`;
    }
}


// -----------------------------------------------------------------------------

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
                        return new ParserError(tree, children, `Unrecognized Literal ATOM Token ${JSON.stringify(tree.value.token)}`);
                    }
                default:
                    return new ParserError(tree, children, `Unrecognized Literal Token ${JSON.stringify(tree.value.token)}`);
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
                    return new TODO(tree, 'Fetch for % & and *');
                default:
                    return new ParserError(tree, children, `Unrecognized Identifier Sigil ${JSON.stringify(tree.value.token.source)}`);
                }
            case 'BAREWORD':
            case 'KEYWORD':
                return new TODO(tree, 'handle BAREWORD and KEYWORD');
            default:
                return new ParserError(tree, children, `Unrecognized Term Value ${JSON.stringify(tree.value)}`);
            }
        case 'SLICE':
            return new TODO(tree, 'handle SLICE');
        case 'OPERATION':
            switch (tree.operator.type) {
            case 'LISTOP':
                if (children.length == 1) {
                    let list = children[0] as AST.ListExpression;
                    return new AST.BuiltIn(tree.operator.token.source, list.items);
                }
                else {
                    return new ParserError(tree, children, `Expected a ListExpression for a LISTOP ${JSON.stringify(children)}`)
                }
            case 'UNOP':
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
                            return new AST.ArrayDeclare(operand.name, operand.value);
                        }
                        else {
                            return new TODO(tree, `Support assignment for Hashes, Code and Globs(?) -> GOT(${JSON.stringify(operand)})`)
                        }
                    } else {
                        return new ParserError(tree, children, `Expected one operands for my() and got ${JSON.stringify(children)}`)
                    }
                case 'our':
                    return new TODO(tree, 'Glob assignment');
                default:
                    return new ParserError(tree, children, `Unrecognized Unary Operator ${JSON.stringify(tree.operator)}`);
                }
            case 'BINOP':
                switch (tree.operator.token.source) {
                // -----------------------------------------------------------------
                // Assignment
                // -----------------------------------------------------------------
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
                            return new TODO(tree, 'Support assignment for Hashes, Code and Globs(?)')
                        }
                    } else {
                        return new ParserError(tree, children, `Expected two operands for assignement(=) and got ${JSON.stringify(children)}`)
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
                    return new ParserError(tree, children, `Unrecognized Binary Operator ${JSON.stringify(tree.operator)}`);
                }
            default:
                return new ParserError(tree, children, `Unrecognized Operator type ${JSON.stringify(tree.operator)}`);
            }
        case 'EXPRESSION':
            switch (tree.kind) {
            case ExpressionKind.BARE:
                return new HMMM(tree, '... this should never actually happen, as BARE Expressions are kind of internal');
            case ExpressionKind.STATEMENT:
                if (children.length == 1) {
                    return new AST.Statement(children[0] as Node);
                } else {
                    return new HMMM(tree, `... statements probably shouldn't have more than one child, but we got ${children.length}`);
                }
            case ExpressionKind.LITERAL:
                switch (tree.lexed[0]?.token.source) {
                case '+[':
                    return new AST.ArrayLiteral(children);
                case '+{':
                    return new TODO(tree, 'implement hash literals')
                default:
                    return new ParserError(tree, children, `Unrecognized Expression Literal bracket ${JSON.stringify(tree)}`);
                }
            case ExpressionKind.CONTROL:
                return new TODO(tree, 'handle control blocks');
            case ExpressionKind.PARENS:
                return new AST.ParenExpression(children);
            case ExpressionKind.LIST:
                return new AST.ListExpression(children);
            case ExpressionKind.SQUARE:
            case ExpressionKind.CURLY:
                return new TODO(tree, 'handle expressions for [] {}');
            default:
                return new ParserError(tree, children, `Unrecognized Expression kind ${JSON.stringify(tree)}`);
            }
        default:
            return new ParserError(tree, children, `Unknown ParseTree type ${JSON.stringify(tree)}`);
        }
    }

}
