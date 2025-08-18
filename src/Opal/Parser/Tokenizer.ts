
import { InputStream } from '../Types'

const IS_NUMBER   = /^-?[0-9][0-9_]*(\.[0-9]+)?$/;
const IS_STRING   = /^"[^"\n]*"|'[^'\n]*'$/;
const IS_BRACKET  = /^\+\{|\+\[|\[|\]|\{|\}|\(|\)$/;

export type TokenType =
    | 'STRING'    // single and double quoted strings
    | 'NUMBER'    // basic int & float parsing only
    | 'BRACKET'   // [] {} () +[] +{}
    | 'ATOM'      // ... everything else

export interface Token {
    type   : TokenType,
    source : string,
}

export type TokenStream = AsyncGenerator<Token, void, void>;

export class Tokenizer {

    async *run (source : InputStream) : TokenStream {

        const SPLITTER = /\+\{|\+\[|\!\=|[\!\;\,\[\]\{\}\(\)]{1}|"([^"])*"|'([^'])*'|[^\;\s\,\[\]\{\}\(\)]+/g;

        const newToken = (tokenType : TokenType, src : string) : Token => {
            return {
                type   : tokenType,
                source : src,
            }
        }

        for await (const chunk of source) {
            if (chunk.trim() === '') continue;

            let lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim() === '') continue;

                let match;
                while ((match = SPLITTER.exec(line)) !== null) {
                    let inComment = false;
                    let m = match[0] as string;
                    switch (true) {
                    case IS_STRING.test(m):
                        yield newToken('STRING', m.slice(1,-1));
                        break;
                    case IS_NUMBER.test(m):
                        yield newToken('NUMBER', m);
                        break;
                    case IS_BRACKET.test(m):
                        yield newToken('BRACKET', m);
                        break;
                    default:
                        if (m == '#') {
                            inComment = true;
                            break;
                        }
                        yield newToken('ATOM', m);
                    }

                    if (inComment) {
                        SPLITTER.lastIndex = 0;
                        break;
                    }
                }
            }
        }
    }
}




