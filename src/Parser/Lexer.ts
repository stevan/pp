
import { Token } from './Tokenizer'

export type LexedType =
    | 'OPEN_PAREN'
    | 'CLOSE_PAREN'
    | 'OPEN_CURLY'
    | 'CLOSE_CURLY'
    | 'OPEN_SQUARE'
    | 'CLOSE_SQUARE'
    | 'LITERAL'
    | 'OPERATOR'
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
                case '['  :
                    yield { type : 'OPEN_SQUARE', token : token }
                    break;
                case '('  :
                    yield { type : 'OPEN_PAREN', token : token }
                    break;
                case '{'  :
                    yield { type : 'OPEN_CURLY', token : token }
                    break;
                case ']'  :
                    yield { type : 'CLOSE_SQUARE', token : token }
                    break;
                case ')'  :
                    yield { type : 'CLOSE_PAREN', token : token }
                    break;
                case '}'  :
                    yield { type : 'CLOSE_CURLY', token : token }
                    break;
                default:
                    throw new Error(`Unknown open/close ${JSON.stringify(token)}`);
                }
                break;
            case 'DIVIDER' :
                switch (token.source) {
                case ';'  :
                    yield { type : 'TERMINATOR', token : token }
                    break;
                case ','  :
                    yield { type : 'SEPERATOR', token : token }
                    break;
                default:
                    throw new Error(`Unknown atom ${JSON.stringify(token)}`);
                }
                break;
            case 'STRING':
            case 'NUMBER':
            case 'BOOLEAN':
                yield { type : 'LITERAL', token : token }
                break;
            case 'ATOM':
                let src = token.source;

                if (src.startsWith('$') ||
                    src.startsWith('@') ||
                    src.startsWith('%') ||
                    src.startsWith('&') ||
                    src.startsWith('*')) {
                    yield { type : 'IDENTIFIER', token : token };
                }
                else {
                    switch (src) {
                    // ---------------------------------------------------------
                    // Operators
                    // ---------------------------------------------------------
                    // Logical
                    case '!'   :
                    case 'not' :
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
                    case '.'  : case 'x'  :
                    // Assignment
                    case '='  :
                        yield { type : 'OPERATOR', token : token }
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

