
import { logger } from '../Tools'

import { Lexed } from './Lexer'

/*

So the lexer should provide more clarity, ...

- OPERATOR is too generic as well, binary and unary ops are needed

Some other things to think about ...

- SEPERATOR will end an expression and needs to be handled correctly
- OPERATOR should also create an expression.

*/


export type Term       = { type : 'TERM',       body : Lexed   }
export type Statement  = { type : 'STATEMENT',  body : Expression }
export type Expression = { type : 'EXPRESSION', body : ParseTree[], parens : boolean }
export type Block      = { type : 'BLOCK',      body : ParseTree[] }

export type ParseTree = Term | Expression | Statement | Block

export class TreeParser {

    *run (source : Generator<Lexed, void, void>) : Generator<ParseTree, void, void> {
        let stack : ParseTree[] = [{ type : 'EXPRESSION', body : [], parens : false }];
        for (const lexed of source) {
            //logger.log('GOT', lexed);
            let term : Term = { type : 'TERM', body : lexed };
            switch (lexed.type) {
            case 'LITERAL':
            case 'KEYWORD':
            case 'BAREWORD':
            case 'IDENTIFIER':
            case 'OPERATOR':
                if (stack.length == 0) {
                    stack.push({ type : 'EXPRESSION', body : [], parens : false });
                }
                (stack.at(-1) as Expression).body.push(term);
                break;
            case 'SEPERATOR':
                //logger.log("SEP STACK", stack);
                let prev = stack.pop() as Expression;
                if (stack.length == 0) {
                    throw new Error("THIS SHOULDNOT HAPPEN ))");
                } else {
                    let parent = stack.at(-1) as Expression;
                    parent.body.push(prev);
                    stack.push({ type : 'EXPRESSION', body : [], parens : false });
                }
                break;
            case 'OPEN_PAREN':
                stack.push({ type : 'EXPRESSION', body : [], parens : true });
                break;
            case 'CLOSE_PAREN':
                let expr = stack.pop() as Expression;
                if (stack.length == 0) {
                    throw new Error("THIS SHOULDNOT HAPPEN ))");
                } else {
                    let parent = stack.at(-1) as Expression;
                    parent.body.push(expr);
                }
                break;
            case 'BLOCK_ENTER':
                stack.push(
                    { type : 'BLOCK', body : [] },
                    { type : 'EXPRESSION', body : [], parens : false }
                );
                break;
            case 'BLOCK_LEAVE':
                let last = stack.pop() as Expression;

                if (stack.length == 0) throw new Error("THIS SHOULDNOT HAPPEN ;}");

                let parent = stack.pop() as Expression;
                if (last.body.length != 0) {
                    parent.body.push({ type : 'STATEMENT', body : last } as Statement);
                }

                if (stack.length == 0) throw new Error("THIS SHOULDNOT HAPPEN }}");

                let block = stack.at(-1) as Expression;
                block.body.push(parent);
                // FIXME:
                // the fallthrough is on purpose, closing a block should end the
                // statement. This will get annoying when we need to use curlies
                // for hash indexing, but we can try to detect this in the
                // lexer and differentiate between bracket usages. Otherwise we
                // might need to rethink this.
                //break;
            case 'TERMINATOR':
                let stmt = { type : 'STATEMENT', body : stack.pop() as Expression } as Statement;
                if (stack.length == 0) {
                    yield stmt;
                } else {
                    let parent = stack.at(-1) as Expression;
                    parent.body.push(stmt);
                }
                stack.push({ type : 'EXPRESSION', body : [], parens : false });
                break;
            case 'OPEN_CURLY':
            case 'CLOSE_CURLY':
            case 'OPEN_SQUARE':
            case 'CLOSE_SQUARE':
                throw new Error('TODO');
            default:
                throw new Error(`Unknown lexed type ${lexed.type}`);
            }
        }

        if (stack.length > 1)
            throw new Error(`Unpopped stack [${JSON.stringify(stack)}]`);

        if (stack[0]?.type == 'EXPRESSION' && (stack[0] as Expression).body.length > 0)
            throw new Error(`Unfinsihed Expression on stack [${JSON.stringify(stack)}]`);

        //while (stack.length > 0) {
        //    console.log('... emptying stack');
        //    let t = stack.pop() as ParseTree;
        //    if (t.type == 'EXPRESSION') {
        //        if (t.body.length > 0) {
        //            yield { type : 'STATEMENT', body : t } as Statement;
        //        }
        //    } else {
        //        throw new Error(`We were expecting an Expression and got (${JSON.stringify(t)})`);
        //    }
        //}
    }
}

