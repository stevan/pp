
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
            let top = from.stack.at(-1) as Expression;
            if (top.kind == ExpressionKind.STATEMENT ||  top.kind == ExpressionKind.CONTROL) break;
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
                        let control = stack.pop() as Expression;
                        if (stack.length == 1) {
                            yield control;
                        } else {
                            (stack.at(-1) as Expression).stack.push(control);
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

