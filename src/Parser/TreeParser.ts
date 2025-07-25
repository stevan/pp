
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
    kind  : ExpressionKind,
    stack : ParseTree[],
    opers : Operation[],
}

export type ParseTree = Term | Expression | Operation

// -----------------------------------------------------------------------------

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
            if (this.config.verbose) {
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
                top = stack.at(-1) as Expression;


                switch (expr.kind) {
                case ExpressionKind.CURLY:
                case ExpressionKind.SQUARE:
                    let prev = top.stack.at(-1) as ParseTree;

                    // check to see if this is a slice
                    if (prev.type == 'TERM' && prev.value.type == 'IDENTIFIER') {
                        top.stack.push(newSlice(top.stack.pop() as Term, expr));
                        // we've pushed the wrapped experssion on the stack
                        // so we can break out of this now
                        break;
                    }

                    let is_control_structure = false;
                    // Most control structures follow a pattern ...
                    if (prev.type == 'TERM' && prev.value.type == 'KEYWORD') {
                        // ------------------------
                        // KEYWORD {BLOCK}
                        // ------------------------
                        // - else {}
                        // ------------------------
                        is_control_structure = true;
                    }
                    else if (prev.type == 'EXPRESSION' && prev.kind == ExpressionKind.PARENS) {
                        let prev_prev = top.stack.at(-2) as ParseTree;
                        if (prev_prev.type == 'TERM' && prev_prev.value.type == 'KEYWORD') {
                            // ------------------------
                            // KEYWORD (PARENS) {BLOCK}
                            // ------------------------
                            // - if    () {}
                            // - elsif () {}
                            // - while () {}
                            // - until () {}
                            // - for   () {}
                            // ------------------------
                            is_control_structure = true;
                        }
                        else if (prev_prev.type == 'TERM' && prev_prev.value.type == 'IDENTIFIER') {
                            // TODO: add the check for the keyword ...
                            // -----------------------------------
                            // KEYWORD IDENTIFIER (PARENS) {BLOCK}
                            // -----------------------------------
                            // - foreach my $x () {}
                            // ------------------------
                            is_control_structure = true;
                        }
                    }

                    // if we found a control structure ...
                    if (is_control_structure) {
                        top.stack.push(expr);
                        top.stack.push(this.spillIntoExpression(top, ExpressionKind.CONTROL));
                        if (stack.length == 1) {
                            yield top.stack.pop() as ParseTree;
                        }
                        break;
                    }

                    // here, we will fall through ...
                case ExpressionKind.PARENS: // and we ignore these for now
                default:                    // and this is where we fall
                    top.stack.push(expr);   // which is the default action
                }
                break;
            case 'TERMINATOR':
                top.stack.push(this.spillIntoExpression(top, ExpressionKind.STATEMENT));
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

