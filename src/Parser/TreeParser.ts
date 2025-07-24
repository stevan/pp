
import { logger } from '../Tools'

import { Lexed } from './Lexer'

export enum ExpressionKind {
    // implicit
    LIST      = 'LIST',
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

export type Term       = { type : 'TERM',       body : Lexed   }
export type Expression = { type : 'EXPRESSION', body : ParseTree[], kind : ExpressionKind }

export type ParseTree = Term | Expression

export class TreeParser {

    *run (source : Generator<Lexed, void, void>) : Generator<ParseTree, void, void> {
        let stack : ParseTree[] = [];
        for (const lexed of source) {
            let term : Term = { type : 'TERM', body : lexed };
            switch (lexed.type) {
            case 'OPEN':
                stack.push({ type : 'EXPRESSION', body : [], kind : BracketToKind(lexed.token.source) });
                break;
            case 'CLOSE':
                let expr = stack.pop() as Expression;
                if (stack.length == 0) {
                    yield expr;
                } else {
                    let parent = stack.at(-1) as Expression;
                    parent.body.push(expr);
                }
                break;
            case 'TERMINATOR':
                let statement = { type : 'EXPRESSION', body : [], kind : ExpressionKind.STATEMENT } as Expression;
                if (stack.length == 0) {
                    yield statement;
                } else {
                    let parent = stack.at(-1) as Expression;
                    while (parent.body.length > 0) {
                        let top = parent.body.at(-1) as ParseTree;
                        if (top.type == 'TERM' || top.kind != ExpressionKind.STATEMENT) {
                            statement.body.unshift(parent.body.pop() as Term);
                        } else {
                            break;
                        }
                    }
                    parent.body.push(statement);
                }
                break;
            case 'SEPERATOR':
            case 'LITERAL':
            case 'KEYWORD':
            case 'BAREWORD':
            case 'IDENTIFIER':
            case 'OPERATOR':
                if (stack.length == 0) {
                    stack.push({ type : 'EXPRESSION', body : [], kind : ExpressionKind.LIST });
                }
                (stack.at(-1) as Expression).body.push(term);
                break;
            default:
                throw new Error(`Unknown lexed type ${lexed.type}`);
            }
        }

        while (stack.length > 0) {
            yield stack.pop() as ParseTree;
        }
    }
}

