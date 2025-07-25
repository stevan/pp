
import { logger } from '../Tools'

import { Lexed } from './Lexer'

export enum ExpressionKind {
    // implicit
    BARE      = 'BARE',
    STATEMENT = 'STATEMENT',
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

export type Term = { type : 'TERM', value : Lexed }

export type Operation  = {
    type     : 'OPERATION',
    operator : Lexed,
    operands : ParseTree[]
}

export type Expression = {
    type  : 'EXPRESSION',
    kind  : ExpressionKind,
    stack : ParseTree[],
    opers : Operation[],
}

export type ParseTree = Term | Expression | Operation

export function newExpression (kind: ExpressionKind, body: ParseTree[] = []) : Expression {
    return {
        type  : 'EXPRESSION',
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

    spillIntoExpression (from: Expression, to: ExpressionKind) : Expression {
        let destination = newExpression(to);
        destination.opers.push(...from.opers.splice(0));
        while (from.stack.length > 0) {
            if ((from.stack.at(-1) as Expression).kind == ExpressionKind.STATEMENT) break;
            destination.stack.unshift(from.stack.pop() as ParseTree);
        }
        this.spillOperatorStack(destination);
        return destination;
    }

    *run (source : Generator<Lexed, void, void>) : Generator<ParseTree, void, void> {
        let stack : Expression[] = [ newExpression(ExpressionKind.BARE) ];
        for (const lexed of source) {
            if (this.config.verbose || this.config.develop) {
                logger.log('== BEFORE ===========================================');
                logger.log('STACK :', stack);
                logger.log('-----------------------------------------------------');
                logger.log('NEXT  :', lexed);
            }

            let top = stack.at(-1) as Expression;
            switch (lexed.type) {
            case 'OPEN':
                stack.push(newExpression(BracketToKind(lexed.token.source)));
                break;
            case 'CLOSE':
                let expr = stack.pop() as Expression;
                this.spillOperatorStack(expr);
                (stack.at(-1) as Expression).stack.push(expr);
                break;
            case 'TERMINATOR':
                top.stack.push(this.spillIntoExpression(top, ExpressionKind.STATEMENT));
                break;
            case 'SEPERATOR':
                this.spillOperatorStack(top);
                break;
            case 'BINOP':
            case 'UNOP':
                top.opers.push(newOperation(lexed));
                break;
            case 'LITERAL':
            case 'KEYWORD':
            case 'BAREWORD':
            case 'IDENTIFIER':
                top.stack.push(newTerm(lexed));
                break;
            default:
                throw new Error(`Unknown lexed type ${lexed.type}`);
            }

            if (this.config.verbose || this.config.develop) {
                logger.log('-- AFTER --------------------------------------------');
                logger.log('STACK :', stack);
                logger.log('=====================================================\n');
            }
        }

        if (this.config.verbose || this.config.develop) {
            logger.log('== FINAL ============================================');
            logger.log('STACK :', stack);
            logger.log('=====================================================\n');
        }

        while (stack.length > 0) {
            yield stack.pop() as ParseTree;
        }
    }
}

