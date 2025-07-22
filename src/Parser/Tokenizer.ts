
import { logger } from '../Logger'

const IS_NUMBER   = /^-?[0-9][0-9_]*(\.[0-9]+)?$/;
const IS_STRING   = /^"[^"]*"|'[^']*'$/;
const IS_BOOLEAN  = /^true|false$/;
const IS_BRACKET  = /^\[|\]|\{|\}|\(|\)$/;
const IS_DIVIDER  = /^\,|\;$/;

const SPLITTER = /[\;\,\.\[\]\{\}\(\)]{1}|"([^"])*"|'([^'])*'|[^\;\s\,\.\[\]\{\}\(\)]+/g;

export type TokenType =
    | 'STRING'    // single and double quoted strings
    | 'NUMBER'    // basic int & float parsing only
    | 'BOOLEAN'   // true false
    | 'BRACKET'   // [] {} ()
    | 'DIVIDER'   // , ;
    | 'ATOM'      // ... everything else

export interface Token {
    type   : TokenType,
    source : string,
    seq_id : number,
}

export class Tokenizer {
    *run (source : Generator<string, void, void>) : Generator<Token, void, void> {
        let TOKEN_ID_SEQ = 0;

        const newToken = (tokenType : TokenType, src : string) : Token => {
            return {
                type   : tokenType,
                source : src,
                seq_id : ++TOKEN_ID_SEQ
            }
        }

        for (const chunk of source) {
            let match;
            while ((match = SPLITTER.exec(chunk)) !== null) {
                let m = match[0] as string;
                switch (true) {
                case IS_STRING.test(m):
                    yield newToken('STRING', m.slice(1,-1));
                    break;
                case IS_NUMBER.test(m):
                    yield newToken('NUMBER', m);
                    break;
                case IS_BOOLEAN.test(m):
                    yield newToken('BOOLEAN', m);
                    break;
                case IS_BRACKET.test(m):
                    yield newToken('BRACKET', m);
                    break;
                case IS_DIVIDER.test(m):
                    yield newToken('DIVIDER', m);
                    break;
                default:
                    yield newToken('ATOM', m);
                }
            }
        }
    }
}

// ... helpers

export function *SourceStream (source : string[]) : Generator<string, void, void> {
    while (source.length) {
        yield source.shift() as string;
    }
}





