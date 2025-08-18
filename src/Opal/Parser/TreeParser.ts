
import { logger } from '../Tools'

import { Lexed, LexedStream } from './Lexer'

// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------

export enum ExpressionKind {
    // implicit
    BARE      = 'BARE',
    LIST      = 'LIST',
    STATEMENT = 'STATEMENT',
    CONTROL   = 'CONTROL',
    DEFINE    = 'DEFINE',
    PRAGMA    = 'PRAGMA',
    // explicit
    PARENS    = 'PARENS',
    SQUARE    = 'SQUARE',
    CURLY     = 'CURLY',
    LITERAL   = 'LITERAL',
}

export type Term =
    | { type : 'TERM',  value : Lexed }
    | { type : 'SLICE', value : Term, slice: Expression }
    | { type : 'APPLY', value : Term, args:  Expression }

export type Operation  = {
    type     : 'OPERATION',
    operator : Lexed,
    operands : ParseTree[]
}

export type Expression = {
    type  : 'EXPRESSION',
    lexed : Lexed[],
    kind  : ExpressionKind,
    stack : ParseTree[],  // this stores the components of the expression
    other : ParseTree[],  // this is for any expression which might branch (if/else, etc.)
    opers : Operation[],  // this is just an operator stack, for mini shunting yard
    defer : Expression[], // deferred control blocks (if/unless waiting for else)
  }

export type ParseTree = Term | Expression | Operation

export type ParseTreeStream = AsyncGenerator<ParseTree, void, void>;

// -----------------------------------------------------------------------------

export function newExpression (kind: ExpressionKind, orig : Lexed, body: ParseTree[] = []) : Expression {
    return {
        type  : 'EXPRESSION',
        lexed : [ orig ],
        kind  : kind,
        stack : body,
        other : [],
        opers : [],
        defer : [],
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

export function newApply (value: Term, args: Expression) : Term {
    return { type : 'APPLY', value, args } as Term
}

// -----------------------------------------------------------------------------

const BracketToKind = (src : string) : ExpressionKind => {
    switch (src) {
    case '(' : case ')' : return ExpressionKind.PARENS;
    case '[' : case ']' : return ExpressionKind.SQUARE;
    case '{' : case '}' : return ExpressionKind.CURLY;
    case '+{': case '+[': return ExpressionKind.LITERAL;
    default: throw new Error(`Unrecognized bracket (${src}`);
    }
}

// ...

export class TreeParser {
    constructor(public config : any = { verbose : false }) {}

    private endExpression (expr : Expression) : void {
        while (expr.opers.length > 0) {
            let op = expr.opers.pop() as Operation;
            if (op.operator.type == 'BINOP') {
                //logger.log("PROCEEING BINOP!", op, expr.stack);
                let rhs = expr.stack.pop() as Term;
                let lhs = expr.stack.pop() as Term;
                op.operands.push(lhs, rhs);
            }
            else if (op.operator.type == 'UNOP') {
                op.operands.push(expr.stack.pop() as Term);
            }
            else if (op.operator.type == 'LISTOP') {
                //logger.log("PROCEEING LISTOP!", op, expr.stack);
                op.operands.push(expr.stack.pop() as Term);
            }
            else {
                throw new Error('NEVER HAPPENS!');
            }
            expr.stack.push(op);
        }
    }

    // NOTE:
    // this one gets a little complicated because it has
    // to resolve any Expression.LIST that has not
    // already been resolved, which can be nested.
    private endStatement (stack: Expression[], orig: Lexed) : Expression {
        //logger.log('STARTING END STATEMENT', stack);

        while (stack.length > 1) {
            let from = stack.at(-1) as Expression;
            if (from.kind == ExpressionKind.LIST
            ||  from.kind == ExpressionKind.PRAGMA) {
                //logger.log('... found LIST', from);
                //logger.log('... PRE OPERATOR SPILL', stack);
                let list = stack.pop() as Expression;
                this.endExpression(list);
                (stack.at(-1) as Expression).stack.push(list);
                //logger.log('... POST OPERATOR SPILL', stack);
            } else {
                //logger.log('... found non-LIST, exiting loop');
                break;
            }
        }

        let from        = stack.at(-1) as Expression;
        let destination = newExpression(ExpressionKind.STATEMENT, orig);
        destination.opers.push(...from.opers.splice(0));
        while (from.stack.length > 0) {
            let top = from.stack.at(-1) as Expression;
            if (top.kind == ExpressionKind.STATEMENT
            ||  top.kind == ExpressionKind.CONTROL
            ||  top.kind == ExpressionKind.DEFINE) break;
            destination.stack.unshift(from.stack.pop() as ParseTree);
        }

        this.endExpression(destination);
        return destination;
    }

    async *run (source : LexedStream) : ParseTreeStream {
        let STACK : Expression[] = [
            {
                type  : 'EXPRESSION',
                lexed : [],
                kind  : ExpressionKind.BARE,
                stack : [],
                other : [],
                opers : [],
                defer : [],
            } as Expression
        ];

        const shouldYieldStatement = () : boolean => STACK.length == 1;

        for await (const lexed of source) {
            if (this.config.verbose) {
                logger.log('== BEFORE ===========================================');
                logger.log('STACK :', STACK);
                logger.log('-----------------------------------------------------');
                logger.log('NEXT  :', lexed);
            }

            let TOP = STACK.at(-1) as Expression;

            if (lexed.token.source != 'else') {
                // =====================================================
                // EXIT POINT!
                // =====================================================
                if (TOP.defer.length > 0) {
                    let deferred = TOP.defer.pop() as Expression;
                    if (shouldYieldStatement()) {
                        yield deferred;
                    } else {
                        TOP.stack.push(deferred);
                    }
                }
            }

            switch (lexed.type) {
            // -----------------------------------------------------------------
            // Expression Entry points
            // -----------------------------------------------------------------
            case 'PRAGMA':
                // pragma entry positon
                STACK.push(newExpression(ExpressionKind.PRAGMA, lexed));
                break;
            case 'KEYWORD':
                // keyword entry positon
                STACK.push(newExpression(ExpressionKind.DEFINE, lexed));
                break;
            case 'CONTROL':
                // control block entry position
                STACK.push(newExpression(ExpressionKind.CONTROL, lexed));
                break;
            case 'OPEN':
                // expression enty point
                STACK.push(newExpression(BracketToKind(lexed.token.source), lexed));
                break;
            // -----------------------------------------------------------------
            // Current Expression Entry points
            // -----------------------------------------------------------------
            // these get pushed into the top stack right away

            case 'BAREWORD':
            case 'LITERAL':
            case 'IDENTIFIER':
                TOP.stack.push(newTerm(lexed));
                break;
            // these get pushed into our mini-shunting yard
            case 'BINOP':
            case 'UNOP':
                TOP.opers.push(newOperation(lexed));
                break;
            // this gets pushed into the mini-shunting yard
            // and a new LIST expression is pushed onto the
            // stack to be operated on ...
            case 'LISTOP':
                TOP.opers.push(newOperation(lexed));
                STACK.push(newExpression(ExpressionKind.LIST, lexed));
                break;

            // -----------------------------------------------------------------
            // Current Expression Exit points
            // -----------------------------------------------------------------

            // this spills the operator stack in the top
            // node, and applies the shunting yard stuff
            case 'SEPERATOR':
                this.endExpression(TOP);
                break;

            // this ends an expression and wraps it in
            // a statement
            case 'TERMINATOR':
                // =====================================================
                // EXIT POINT
                // =====================================================

                // if we have a LIST, that means it does not
                // have an accompanying CLOSE, and while we
                // handle this in the endStatement method,
                // we also make a note to let us know that
                // this was where the expression ended
                if (TOP.kind == ExpressionKind.LIST) {
                    TOP.lexed.push(lexed);
                }

                let statement = this.endStatement(STACK, lexed);
                if (shouldYieldStatement()) {
                    yield statement;
                } else {
                    (STACK.at(-1) as Expression).stack.push(statement);
                }
                break;

            // this exits the current expression
            case 'CLOSE':
                let expr = STACK.pop() as Expression;
                this.endExpression(expr);
                expr.lexed.push(lexed);

                // restore the top variable ...
                TOP = STACK.at(-1) as Expression;

                if (TOP == undefined) {
                    console.log("FUCK", STACK, expr);
                }

                // Now check the TOP variable to see
                // if we need to do anything more
                switch (expr.kind) {
                case ExpressionKind.CURLY:
                    // if we had a CURLY, whose parent is a CONTROL
                    // then we know it is a block ...
                    if (TOP.kind == ExpressionKind.CONTROL || TOP.kind == ExpressionKind.DEFINE) {
                        // pop off TOP as the control expression
                        let control = STACK.pop() as Expression;
                        // then we need to add the block into
                        // the control expression's stack

                        // but before we do that, we need to make sure that
                        // the block ends with a statement of some kind
                        let lastExpr = expr.stack.at(-1) as ParseTree;
                        if (lastExpr.type != 'EXPRESSION'
                        || (lastExpr.kind != ExpressionKind.STATEMENT
                        &&  lastExpr.kind != ExpressionKind.CONTROL)
                        ){
                            expr.stack.push(this.endStatement([ expr ], lexed));
                        }

                        // now push the control expression
                        // on the stack ...
                        control.stack.push(expr);

                        // restore the top variable ...
                        TOP = STACK.at(-1) as Expression;

                        // now we need to check if this is
                        // an if/unless that might have an
                        // else block ...
                        let keyword = (control.lexed[0] as Lexed).token.source;
                        if (keyword == 'if' || keyword == 'unless') {
                            // defer these, we will check
                            // on them later
                            TOP.defer.push(control);
                            break;
                        }
                        else if (keyword == 'else') {
                            // else's do not ever get yielded
                            let deferred = TOP.defer.pop() as Expression;
                            if (deferred == undefined) throw new Error("WTF! Can't have an else with an if/unless");
                            // we simply add them to the other of their parent
                            deferred.other.push(control);
                            // and return the parent ...
                            control = deferred;
                        }

                        // =====================================================
                        // EXIT POINT!
                        // =====================================================

                        // now decide if we should yield
                        // or if this needs to put pushed
                        // to the TOP variable's stack?
                        if (shouldYieldStatement()) {
                            yield control;
                        } else {
                            TOP.stack.push(control);
                        }
                        break;
                    }
                    // NOTE the fall through here, this handles
                    // both array and hash literals and slices
                    // sorry :(
                case ExpressionKind.SQUARE:
                case ExpressionKind.PARENS:
                    // check to see if there is anything in the
                    // the TOP stack ...
                    let prev = TOP.stack.at(-1) as ParseTree;

                    // if there is nothing ...
                    if (prev == undefined) {
                        // =====================================================
                        // EXIT POINT - FIXME???
                        // =====================================================
                        // I am not 100% sure of when this happens, but I think
                        // it might be related to the array/hash literals and
                        // they have since been moved to +[] and +{} so this
                        // code can likely just go away or be replaced by the
                        // appropriate error.

                        if (shouldYieldStatement()) {
                            yield expr;
                            break;
                        }
                    }
                    // if we have something else on the
                    // TOP stack, then we check it ...
                    else if (prev.type == 'TERM') {
                        if (prev.value.type == 'IDENTIFIER' && (expr.kind == ExpressionKind.CURLY || expr.kind == ExpressionKind.SQUARE)) {
                            // if the previous token is an IDENTIFIER,
                            // then we have a slice ...
                            TOP.stack.push(newSlice(TOP.stack.pop() as Term, expr));

                            // we've pushed the wrapped experssion on the stack
                            // so we can break out of this now
                            break;
                        }
                        else if (prev.value.type == 'BAREWORD' && expr.kind == ExpressionKind.PARENS) {
                            // ignore this if we are directly inside a definition
                            if (TOP.kind != ExpressionKind.DEFINE) {
                                TOP.stack.push(newApply(TOP.stack.pop() as Term, expr));
                                // we've pushed the wrapped experssion on the stack
                                // so we can break out of this now
                                break;
                            }
                        }
                    }
                    // otherwise, we will fall through ...
                case ExpressionKind.LITERAL: // and these should just fall through
                default:                     // and this is where we fall
                    TOP.stack.push(expr);    // which is the default action
                }
                break;
            default:
                throw new Error(`Unknown lexed type ${lexed.type}`);
            }

            if (this.config.verbose) {
                logger.log('-- AFTER --------------------------------------------');
                logger.log('STACK :', STACK);
                logger.log('=====================================================\n');
            }
        }

        //logger.log('END LOOP STACK :', STACK);

        if (STACK.length > 1) {
            if (this.config.verbose) {
                logger.log('== FLUSH ============================================');
                logger.log('STACK :', STACK);
                logger.log('=====================================================\n');
            }

            while (STACK.length > 1) {
                yield STACK.pop() as ParseTree;
            }
        }

        let rootExpr = STACK[0] as Expression;

        while (rootExpr.defer.length > 0) {
            yield rootExpr.defer.pop() as Expression;
        }

        // ???
    }
}

