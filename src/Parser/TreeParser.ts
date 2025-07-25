
import { logger } from '../Tools'

import { Lexed } from './Lexer'

// -----------------------------------------------------------------------------

export enum ExpressionKind {
    // implicit
    BARE      = 'BARE',
    STATEMENT = 'STATEMENT',
    CONTROL   = 'CONTROL',
    // explicit
    PARENS    = 'PARENS',
    SQUARE    = 'SQUARE',
    CURLY     = 'CURLY',
}

const BracketToKind = (src : string) : ExpressionKind => {
    switch (src) {
    case '(': case ')': return ExpressionKind.PARENS;
    case '[': case ']': return ExpressionKind.SQUARE;
    case '{': case '}': return ExpressionKind.CURLY;
    default: throw new Error(`Unrecognized bracket (${src}`);
    }
}

// -----------------------------------------------------------------------------

export type Term =
    | { type : 'TERM',  value : Lexed }
    | { type : 'SLICE', value : Term, slice: Expression }

export type Operation  = {
    type     : 'OPERATION',
    operator : Lexed,
    operands : ParseTree[]
}

export type Expression = {
    type  : 'EXPRESSION',
    lexed : Lexed[],
    kind  : ExpressionKind,
    stack : ParseTree[],
    opers : Operation[],
  }

export type ParseTree = Term | Expression | Operation

// -----------------------------------------------------------------------------

export function newExpression (kind: ExpressionKind, orig : Lexed, body: ParseTree[] = []) : Expression {
    return {
        type  : 'EXPRESSION',
        lexed : [ orig ],
        kind  : kind,
        stack : body,
        opers : [],
    } as Expression
}

export function newOperation (orig: Lexed, body: ParseTree[] = []) : Operation {
    return {
        type     : 'OPERATION',
        operator : orig,
        operands : body,
    } as Operation
}

export function newTerm (orig: Lexed) : Term {
    return { type : 'TERM', value : orig } as Term
}

export function newSlice (value: Term, slice: Expression) : Term {
    return { type : 'SLICE', value, slice } as Term
}

// -----------------------------------------------------------------------------

export class TreeParser {
    constructor(public config : any = {}) {}

    private spillOperatorStack (expr : Expression) : void {
        while (expr.opers.length > 0) {
            let op = expr.opers.pop() as Operation;
            if (op.operator.type == 'BINOP') {
                let rhs = expr.stack.pop() as Term;
                let lhs = expr.stack.pop() as Term;
                op.operands.push(lhs, rhs);
            }
            else if (op.operator.type == 'UNOP') {
                op.operands.push(expr.stack.pop() as Term);
            } else {
                throw new Error('NEVER HAPPENS!');
            }
            expr.stack.push(op);
        }
    }

    spillIntoExpression (from: Expression, to: ExpressionKind, orig: Lexed) : Expression {
        let destination = newExpression(to, orig);
        destination.opers.push(...from.opers.splice(0));
        while (from.stack.length > 0) {
            if ((from.stack.at(-1) as Expression).kind == ExpressionKind.STATEMENT) break;
            destination.stack.unshift(from.stack.pop() as ParseTree);
        }
        this.spillOperatorStack(destination);
        return destination;
    }

    *run (source : Generator<Lexed, void, void>) : Generator<ParseTree, void, void> {
        let stack : Expression[] = [
            {
                type  : 'EXPRESSION',
                lexed : [],
                kind  : ExpressionKind.BARE,
                stack : [],
                opers : [],
            } as Expression
        ];

        for (const lexed of source) {
            if (this.config.verbose) {
                logger.log('== BEFORE ===========================================');
                logger.log('STACK :', stack);
                logger.log('-----------------------------------------------------');
                logger.log('NEXT  :', lexed);
            }

            let top = stack.at(-1) as Expression;

            if (top.kind == ExpressionKind.CONTROL  &&
                top.lexed[0]?.token.source == 'if'  &&
                (top.stack[0]?.type == 'EXPRESSION' && top.stack[0]?.kind == ExpressionKind.PARENS) &&
                (top.stack[1]?.type == 'EXPRESSION' && top.stack[1]?.kind == ExpressionKind.CURLY ) &&
                lexed.token.source != 'else'
            ) {
                let ifExpr = stack.pop() as Expression;
                top = stack.at(-1) as Expression;
                if (stack.length == 1) {
                    yield ifExpr;
                } else {
                    top.stack.push(ifExpr);
                }
            }

            switch (lexed.type) {
            case 'CONTROL':
                stack.push(newExpression(ExpressionKind.CONTROL, lexed));
                break;
            case 'OPEN':
                stack.push(newExpression(BracketToKind(lexed.token.source), lexed));
                break;
            case 'CLOSE':
                let expr = stack.pop() as Expression;
                this.spillOperatorStack(expr);
                expr.lexed.push(lexed);

                // restore the top variable ...
                top = stack.at(-1) as Expression;

                switch (expr.kind) {
                case ExpressionKind.CURLY:
                    if (top.kind == ExpressionKind.CONTROL) {
                        top.stack.push(expr);

                        let src = (top.lexed[0] as Lexed).token.source;
                        if (src != 'if') {
                            if (src == 'else') {
                                let elseExpr = stack.pop()  as Expression;
                                let ifExpr   = stack.at(-1) as Expression;
                                if (ifExpr.kind == ExpressionKind.CONTROL) {
                                    ifExpr.stack.push(elseExpr);
                                } else {
                                    throw new Error('An else expressions must be preceeded by if');
                                }
                            }

                            yield stack.pop() as Expression;
                        }
                        break;
                    }
                case ExpressionKind.SQUARE:
                    // check to see if this is a slice
                    let prev = top.stack.at(-1) as ParseTree;
                    if (prev.type == 'TERM' && prev.value.type == 'IDENTIFIER') {
                        top.stack.push(newSlice(top.stack.pop() as Term, expr));
                        // we've pushed the wrapped experssion on the stack
                        // so we can break out of this now
                        break;
                    }
                    // otherwise, we will fall through ...
                case ExpressionKind.PARENS: // and we ignore these for now
                default:                    // and this is where we fall
                    top.stack.push(expr);   // which is the default action
                }
                break;
            case 'TERMINATOR':
                top.stack.push(this.spillIntoExpression(top, ExpressionKind.STATEMENT, lexed));
                if (stack.length == 1) {
                    yield top.stack.pop() as ParseTree;
                }
                break;
            case 'SEPERATOR':
                this.spillOperatorStack(top);
                break;
            case 'BINOP':
            case 'UNOP':
                top.opers.push(newOperation(lexed));
                break;
            case 'LITERAL':
            case 'BAREWORD':
            case 'KEYWORD':
            case 'IDENTIFIER':
                top.stack.push(newTerm(lexed));
                break;
            default:
                throw new Error(`Unknown lexed type ${lexed.type}`);
            }

            if (this.config.verbose) {
                logger.log('-- AFTER --------------------------------------------');
                logger.log('STACK :', stack);
                logger.log('=====================================================\n');
            }
        }

        if ((stack.at(-1) as Expression).kind == ExpressionKind.CONTROL) {
            yield stack.pop() as Expression;
        }

        if (this.config.verbose) {
            logger.log('== FINAL ============================================');
            logger.log('STACK :', stack);
            logger.log('=====================================================\n');
        }

        while (stack.length > 1) {
            yield stack.pop() as ParseTree;
        }
    }
}

