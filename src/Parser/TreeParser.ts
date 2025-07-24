
import { logger } from '../Tools'

import { Lexed } from './Lexer'

/*

So the lexer should provide more clarity, ...

- OPEN/CLOSE is too generic, we need ones for each brack type
- OPERATOR is too generic as well, binary and unary ops are needed

Some other things to think about ...

- SEPERATOR will end an expression and needs to be handled correctly
- OPERATOR should also create an expression.
- CLOSE on a block might need to wrap it's body in a statement
    - this will happen if the ; is left off the last expresion

Some stuff to do ...

- KEYWORD if it starts with one, it is probably a control structure
    - this can mostly be handled like the others ...

*/


export type Term = { type : 'TERM', body : Lexed   }
export type Stmt = { type : 'STMT', body : Expr }
export type Expr = { type : 'EXPR', body : Parsed[], parens : boolean }
export type Blck = { type : 'BLCK', body : Parsed[] }

export type Parsed = Term | Expr | Stmt | Blck

export class TreeParser {

    *run (source : Generator<Lexed, void, void>) : Generator<Parsed, void, void> {
        let stack : Parsed[] = [{ type : 'EXPR', body : [], parens : false }];
        for (const lexed of source) {
            //logger.log('GOT', lexed);
            let term : Term = { type : 'TERM', body : lexed };
            switch (lexed.type) {
            case 'LITERAL':
            case 'KEYWORD':
            case 'BAREWORD':
            case 'IDENTIFIER':
            case 'OPERATOR':
            case 'SEPERATOR':
                if (stack.length == 0) {
                    stack.push({ type : 'EXPR', body : [], parens : false });
                }
                (stack.at(-1) as Expr).body.push(term);
                break;
            case 'OPEN_PAREN':
                stack.push({ type : 'EXPR', body : [], parens : true });
                break;
            case 'CLOSE_PAREN':
                let expr = stack.pop() as Expr;
                if (stack.length == 0) {
                    throw new Error("THIS SHOULDNOT HAPPEN ))");
                } else {
                    let parent = stack.at(-1) as Expr;
                    parent.body.push(expr);
                }
                break;
            case 'OPEN_CURLY':
                stack.push(
                    { type : 'BLCK', body : [] },
                    { type : 'EXPR', body : [], parens : false }
                );
                break;
            case 'CLOSE_CURLY':
                //logger.log('CLOSE CURLY STACK', stack);
                let last = stack.pop() as Expr;

                if (stack.length == 0) throw new Error("THIS SHOULDNOT HAPPEN ;}");

                let parent = stack.pop() as Expr;
                if (last.body.length != 0) {
                    parent.body.push({ type : 'STMT', body : last } as Stmt);
                }

                if (stack.length == 0) throw new Error("THIS SHOULDNOT HAPPEN }}");

                let block = stack.at(-1) as Expr;
                block.body.push(parent);
                //logger.log('END>>>> CLOSE CURLY STACK', stack);
                break;
            case 'TERMINATOR':
                //logger.log('TERM STACK', stack);
                let stmt = { type : 'STMT', body : stack.pop() as Expr } as Stmt;
                if (stack.length == 0) {
                    //logger.log('yield TERMINATOR', stmt);
                    yield stmt;
                } else {
                    //logger.log('push TERMINATOR', stmt);
                    let parent = stack.at(-1) as Expr;
                    parent.body.push(stmt);
                }
                stack.push({ type : 'EXPR', body : [], parens : false });
                break;
            case 'OPEN_SQUARE':
            case 'CLOSE_SQUARE':
                throw new Error('TODO');
            default:
                throw new Error(`Unknown lexed type ${lexed.type}`);
            }
        }

        //logger.log('END STACK', stack);

        while (stack.length > 0) {
            yield stack.pop() as Parsed;
        }
    }
}

