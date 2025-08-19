
import { InputStream } from '../Types'

const OPERATORS   = /(\+\{|\+\[|\{|\}|\[|\]|\+|\-|\*|\/|\%|\.|\<\=|\>\=|\=\>|\=\=|\!\=|\!|\<|\>|\=|\:\:|\:|\;|\,|\#)/;
const SYMBOLS     = /([\$\@\%\&]?[a-zA-Z_][a-zA-Z0-9_])/;
const NUMBERS     = /(?<![a-zA-Z])(-?[0-9][0-9_]*\.[0-9][0-9]*)/;

const IS_VSTRING  = /^v[0-9]\.[0-9]+$/
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
        let SPLITTER = /"([^"])*"|'([^'])*'|\;|\(|\)|[^\s\;\(|\)]+/g;

        for await (const src of source) {
            if (src.trim() === '') continue;

            let lines = src
                .split('\n')
                .filter((l) => !(l.trim().startsWith('#')))
                .filter((l) => l.length > 0);

            for (const line of lines) {

                let match;
                while ((match = SPLITTER.exec(line)) !== null) {
                    let chunk = match[0] as string;

                    if (chunk.trim() == '') continue;

                    let inComment = false;
                    if (chunk.startsWith('#')) {
                        // console.log('ENTERING COMMENT (start of string)');
                        inComment = true;
                    }
                    else if (chunk == '(' || chunk == ')') {
                        // console.log('YIELD BRACKET (usually parens)', chunk);
                        yield { type : 'BRACKET', source : chunk };
                    }
                    else if (chunk.startsWith('"') || chunk.startsWith("'")) {
                        // console.log('YIELD STRING', chunk);
                        yield { type : 'STRING', source : chunk.slice(1, -1) };
                    }
                    else {
                        let maybeMoreComment = false;

                        if (chunk.indexOf('#') != -1) {
                            // console.log('ENTERING COMMENT (middle of string)');
                            chunk = chunk.substring(0, chunk.indexOf('#'));
                            // console.log('ENTERING COMMENT (processing remaining)', chunk);
                            maybeMoreComment = true;
                        }

                        // console.log('???? CHECKIN FOR NUMBERS', chunk);

                        let numberSplit = chunk.split(NUMBERS).filter((t) => t.length > 0);
                        for (const maybeNumber of numberSplit) {
                            // console.log('!!!! MAYBE NUMBER', maybeNumber);

                            if (IS_VSTRING.test(maybeNumber)) {
                                // console.log('YIELD ATOM (vstring)', maybeNumber);
                                yield { type : 'ATOM', source : maybeNumber };
                            }
                            else if (IS_NUMBER.test(maybeNumber)) {
                                // console.log('YIELD NUMBER', maybeNumber);
                                yield { type : 'NUMBER', source : maybeNumber };
                            }
                            else {
                                let finalSplit = maybeNumber.split(OPERATORS).filter((t) => t.length > 0);
                                for (const token of finalSplit) {
                                    if (token == '#') {
                                        // console.log('ENTERING COMMENT (last chance)');
                                        inComment = true;
                                        break;
                                    }
                                    switch (true) {
                                    case IS_NUMBER.test(token):
                                        // console.log('YIELD NUMBER (hmmm)', token);
                                        yield { type : 'NUMBER', source : token };
                                        break;
                                    case IS_BRACKET.test(token):
                                        // console.log('YIELD BRACKET', token);
                                        yield { type : 'BRACKET', source : token }
                                        break;
                                    default:
                                        // console.log('YIELD ATOM', token);
                                        yield { type : 'ATOM', source : token };
                                    }
                                }
                            }
                            if (inComment) break; // break out of the number loop
                        }
                        if (maybeMoreComment) inComment = true;
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




