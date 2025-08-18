

import { ParseTree, ParseTreeStream, ExpressionKind } from './TreeParser'
import { visitParseTree } from './ParseTreeVisitor'
import { GlobSlot  } from '../Runtime/API'

import * as AST from './AST'
import { Node } from './AST'

// -----------------------------------------------------------------------------

export type ASTNodeStream = AsyncGenerator<Node, void, void>;

// -----------------------------------------------------------------------------

export class ASTBuilder {

    async *run (source : ParseTreeStream) : ASTNodeStream {
        for await (const tree of source) {
            yield this.parse(tree);
        }
    }

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
                        return new AST.ParserError(tree, children, `Unrecognized Literal ATOM Token ${JSON.stringify(tree.value.token)}`);
                    }
                default:
                    return new AST.ParserError(tree, children, `Unrecognized Literal Token ${JSON.stringify(tree.value.token)}`);
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
                    return new AST.TODO(tree, 'Fetch for % & and *');
                default:
                    return new AST.ParserError(tree, children, `Unrecognized Identifier Sigil ${JSON.stringify(tree.value.token.source)}`);
                }
            case 'BAREWORD':
                return new AST.Bareword(tree.value.token.source);
            default:
                return new AST.ParserError(tree, children, `Unrecognized Term Value ${JSON.stringify(tree.value)}`);
            }
        case 'SLICE':
            return new AST.TODO(tree, 'handle SLICE');
        case 'APPLY':
            return new AST.CallSub(
                children.shift() as AST.Bareword,
                children,
            );
        case 'OPERATION':
            switch (tree.operator.type) {
            case 'LISTOP':
                if (children.length == 1) {
                    let list = children[0] as AST.ListExpression;
                    switch (tree.operator.token.source) {
                    case 'require':
                        return new AST.Require(list.items);
                    default:
                        return new AST.BuiltInFunction(tree.operator.token.source, list.items);
                    }
                }
                else {
                    return new AST.ParserError(tree, children, `Expected a ListExpression for a LISTOP ${JSON.stringify(children)}`)
                }
            case 'UNOP':
                switch (tree.operator.token.source) {
                // -----------------------------------------------------------------
                // Assignment
                // -----------------------------------------------------------------
                case 'return':
                    return new AST.SubReturn(children[0] as Node);
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
                            return new AST.TODO(tree, `Support assignment for Hashes, Code and Globs(?) -> GOT(${JSON.stringify(operand)})`)
                        }
                    } else {
                        return new AST.ParserError(tree, children, `Expected one operands for my() and got ${JSON.stringify(children)}`)
                    }
                case 'our':
                    if (children.length == 1) {
                        let operand = children[0] as Node;

                        if (operand instanceof AST.ScalarStore) {
                            return new AST.GlobDeclare(
                                new AST.GlobVar(operand.name, GlobSlot.SCALAR),
                                operand.value
                            );
                        }
                        else {
                            return new AST.TODO(tree, `Support Glob assignment for Arrays, Hashes, Code and Globs(?) -> GOT(${JSON.stringify(operand)})`)
                        }
                    } else {
                        return new AST.ParserError(tree, children, `Expected one operands for our() and got ${JSON.stringify(children)}`)
                    }
                default:
                    return new AST.BuiltInUnary(tree.operator.token.source, children[0] as Node);
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
                            return new AST.TODO(tree, 'Support assignment for Hashes, Code and Globs(?)')
                        }
                    } else {
                        return new AST.ParserError(tree, children, `Expected two operands for assignement(=) and got ${JSON.stringify(children)}`)
                    }
                // -----------------------------------------------------------------
                // String
                // -----------------------------------------------------------------
                case '.':
                    return new AST.Concat(children[0] as Node, children[1] as Node);
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
                    return new AST.Divide(children[0] as Node, children[1] as Node);
                case '%':
                    return new AST.Modulus(children[0] as Node, children[1] as Node);
                // -----------------------------------------------------------------
                // Equality
                // -----------------------------------------------------------------
                case '==':
                case 'eq':
                    return new AST.Equal(children[0] as Node, children[1] as Node);
                case '!=':
                case 'ne':
                    return new AST.NotEqual(children[0] as Node, children[1] as Node);
                // -----------------------------------------------------------------
                // Ordering
                // -----------------------------------------------------------------
                case '<':
                case 'lt':
                    return new AST.LessThan(children[0] as Node, children[1] as Node);
                case '>':
                case 'gt':
                    return new AST.GreaterThan(children[0] as Node, children[1] as Node);
                case '<=':
                case 'le':
                    return new AST.LessThanOrEqual(children[0] as Node, children[1] as Node);
                case '>=':
                case 'ge':
                    return new AST.GreaterThanOrEqual(children[0] as Node, children[1] as Node);
                // -----------------------------------------------------------------
                default:
                    return new AST.ParserError(tree, children, `Unrecognized Binary Operator ${JSON.stringify(tree.operator)}`);
                }
            default:
                return new AST.ParserError(tree, children, `Unrecognized Operator type ${JSON.stringify(tree.operator)}`);
            }
        case 'EXPRESSION':
            switch (tree.kind) {
            case ExpressionKind.BARE:
                return new AST.HMMM(tree, '... this should never actually happen, as BARE Expressions are kind of internal');
            case ExpressionKind.PRAGMA:
                if (children.length == 1) {
                    return new AST.Pragma(
                        tree.lexed[0]?.token.source as string,
                        children[0] as AST.Bareword
                    );
                } else {
                    return new AST.ParserError(tree, children, `Unexpected pragma args ${JSON.stringify(tree)}`);
                }
            case ExpressionKind.STATEMENT:
                if (children.length == 1) {
                    return new AST.Statement(children[0] as Node);
                } else if (children.length == 0) {
                    return new AST.EmptyStatement();
                } else {
                    return new AST.HMMM(tree, `... statements probably shouldn't have more than one child, but we got ${children.length}`);
                }
            case ExpressionKind.LITERAL:
                switch (tree.lexed[0]?.token.source) {
                case '+[':
                    return new AST.ArrayLiteral(children);
                case '+{':
                    return new AST.TODO(tree, 'implement hash literals')
                default:
                    return new AST.ParserError(tree, children, `Unrecognized Expression Literal bracket ${JSON.stringify(tree)}`);
                }
            case ExpressionKind.DEFINE:
                switch (tree.lexed[0]?.token.source) {
                // -------------------------------------------------------------
                // Declarations
                // -------------------------------------------------------------
                case 'sub':
                    if (children.length == 3) {
                        // FIXME: convert these to asserts
                        let name   = children[0] as AST.Bareword;
                        let params = children[1] as AST.ExpressionNode;
                        let block  = children[2] as AST.Block;

                        return new AST.Statement(
                            new AST.SubDefinition(
                                name,
                                ((params instanceof AST.ParenExpression)
                                    ? new AST.ListExpression([(params as AST.ParenExpression).item])
                                    : params as AST.ListExpression),
                                ((block instanceof AST.SubBody)
                                    ? block
                                    : new AST.SubBody(block.statements))
                            )
                        );
                    } else {
                        return new AST.ParserError(tree, children, `Expected only 3 children, got ${children.length}`);
                    }
                default:
                    return new AST.ParserError(tree, children, `Unrecognized Definition type ${JSON.stringify(tree)}`);
                }
            case ExpressionKind.CONTROL:
                switch (tree.lexed[0]?.token.source) {
                // -------------------------------------------------------------
                // Control structures
                // -------------------------------------------------------------
                // Conditionals
                // -------------------------------------------------------------
                case 'if'      :
                case 'unless'  :
                    return new AST.Statement(
                        new AST.Conditional(
                            new AST.Keyword(tree.lexed[0]?.token.source),
                            children[0] as AST.ParenExpression,
                            children[1] as AST.Block,
                            children[2] as AST.Block,
                        )
                    );
                case 'else'    :
                    return children[0] as AST.Block;
                case 'elsif'   :
                    return new AST.TODO(tree, 'handle elsif blocks');
                // -------------------------------------------------------------
                // Conditional Loops
                // -------------------------------------------------------------
                case 'while'   :
                case 'until'   :
                    return new AST.Statement(
                        new AST.ConditionalLoop(
                            new AST.Keyword(tree.lexed[0]?.token.source),
                            children[0] as AST.ParenExpression,
                            children[1] as AST.Block,
                        )
                    );
                // -------------------------------------------------------------
                // exception handling
                // -------------------------------------------------------------
                case 'try'     :
                case 'finally' :
                    return new AST.TODO(tree, 'handle unary control blocks');
                case 'catch'   :
                    return new AST.TODO(tree, 'handle catch control block (with args)');
                // -------------------------------------------------------------
                // the others ...
                // -------------------------------------------------------------
                case 'do'      :
                    return new AST.TODO(tree, 'handle do blocks');
                case 'for'     :
                case 'foreach' :
                    return new AST.TODO(tree, 'handle for/foreach (iterator) control blocks');
                default:
                    return new AST.ParserError(tree, children, `Unrecognized Control Structure ${JSON.stringify(tree)}`);
                }
            case ExpressionKind.PARENS:
                if (children.length == 0) {
                    return new AST.ListExpression(children);
                } else if (children.length == 1) {
                    return new AST.ParenExpression(children[0] as Node);
                } else {
                    return new AST.ListExpression(children);
                }
            case ExpressionKind.CURLY:
                return new AST.Block(children as AST.Statement[]);
            case ExpressionKind.SQUARE:
                return new AST.TODO(tree, 'handle expressions for [] {}');
            default:
                return new AST.ParserError(tree, children, `Unrecognized Expression kind ${JSON.stringify(tree)}`);
            }
        default:
            return new AST.ParserError(tree, children, `Unknown ParseTree type ${JSON.stringify(tree)}`);
        }
    }

}
