
import { Token } from './Tokenizer'

export type LexedType =
    | 'OPEN'
    | 'CLOSE'
    | 'LITERAL'
    | 'BINOP'
    | 'UNOP'
    | 'KEYWORD'
    | 'BAREWORD'
    | 'IDENTIFIER'
    | 'SEPERATOR'
    | 'TERMINATOR'

export interface Lexed {
    type  : LexedType,
    token : Token,
}

export class Lexer {

    *run (source : Generator<Token, void, void>) : Generator<Lexed, void, void> {
        for (const token of source) {
            switch (token.type) {
            case 'BRACKET' :
                switch (token.source) {
                case '('  :
                case '['  :
                case '{'  :
                    yield { type : 'OPEN', token : token }
                    break;
                case ')'  :
                case ']'  :
                case '}'  :
                    yield { type : 'CLOSE', token : token }
                    break;
                default:
                    throw new Error(`Unknown bracket ${JSON.stringify(token)}`);
                }
                break;
            case 'STRING':
            case 'NUMBER':
                yield { type : 'LITERAL', token : token }
                break;
            case 'ATOM':
                let src = token.source;

                if (src.length > 1 &&
                    (src.startsWith('$') ||
                     src.startsWith('@') ||
                     src.startsWith('%') ||
                     src.startsWith('&') ||
                     src.startsWith('*'))) {
                    yield { type : 'IDENTIFIER', token : token };
                }
                else {
                    switch (src) {
                    // ---------------------------------------------------------
                    // Stuff
                    // ---------------------------------------------------------
                    // literals ...
                    case 'undef':
                    case 'true':
                    case 'false':
                        yield { type : 'LITERAL', token : token };
                        break;
                    // Dividers
                    case ';' :
                        yield { type : 'TERMINATOR', token : token }
                        break;
                    case ','  :
                        yield { type : 'SEPERATOR', token : token }
                        break;
                    // ---------------------------------------------------------
                    // Operators
                    // ---------------------------------------------------------
                    // Logical
                    case '!'   :
                    case 'not' :
                        yield { type : 'UNOP', token : token }
                        break;
                    case '&&'  : case '||' :
                    case 'and' : case 'or' :
                    // Equality
                    case '==' : case '!=' :
                    case 'eq' : case 'ne' :
                    // Ordering
                    case '<'  : case '<=' : case '>'  : case '>=' :
                    case 'lt' : case 'le' : case 'gt' : case 'ge' :
                    // Maths
                    case '+'  : case '-'  : case '*'  : case '/'  : case '%':
                    // String
                    case '.'  :
                    // Assignment
                    case '='  :
                        yield { type : 'BINOP', token : token }
                        break;
                    // ---------------------------------------------------------
                    // Keywords
                    // ---------------------------------------------------------
                    // declarations
                    case 'my'     :
                    case 'our'    :
                    case 'sub'    :
                    // control structures
                    case 'if'     :
                    case 'else'   :
                    // misc ...
                    case 'return' :
                        yield { type : 'KEYWORD', token : token }
                        break;
                    default:
                        yield { type : 'BAREWORD', token : token };
                    }
                }
                break;
            default:
                throw new Error(`Unknown token type ${token.type}`);
            }
        }
    }
}

