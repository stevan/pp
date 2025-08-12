
import { Token, TokenStream } from './Tokenizer'

export type LexedType =
    | 'OPEN'
    | 'CLOSE'
    | 'LITERAL'
    | 'BINOP'
    | 'UNOP'
    | 'LISTOP'
    | 'KEYWORD'
    | 'PRAGMA'
    | 'CONTROL'
    | 'BAREWORD'
    | 'IDENTIFIER'
    | 'SEPERATOR'
    | 'TERMINATOR'

export interface Lexed {
    type  : LexedType,
    token : Token,
}

export type LexedStream = AsyncGenerator<Lexed, void, void>;

export class Lexer {

    async *run (source : TokenStream) : LexedStream {
        for await (const token of source) {
            switch (token.type) {
            case 'BRACKET' :
                switch (token.source) {
                case '('  :
                case '['  :
                case '{'  :
                case '+['  :
                case '+{'  :
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
                    // Statement Divider
                    case ';' :
                        yield { type : 'TERMINATOR', token : token }
                        break;
                    // Expression Seperator
                    case ','  :
                        yield { type : 'SEPERATOR', token : token }
                        break;

                    // =========================================================
                    // Debugging
                    // =========================================================
                    // these are basically treated like builtins
                    // but will do things that mess with the
                    // guts of the system to help in debugging

                    case 'concise' :
                        yield { type : 'LISTOP', token : token }
                        break;

                    // =========================================================
                    // Literals
                    // =========================================================

                    // literals ...
                    case 'undef':
                    case 'true':
                    case 'false':
                        yield { type : 'LITERAL', token : token };
                        break;

                    // =========================================================
                    // Operators
                    // =========================================================

                    // Logical
                    case '!'   :
                    case 'not' :
                        yield { type : 'UNOP', token : token }
                        break;

                    // Logical
                    case '&&'  : case '||' : case '//':
                    case 'and' : case 'or' : case 'xor':
                    // Equality
                    case '==' : case '!=' :
                    case 'eq' : case 'ne' :
                    // Ordering
                    case '<'  : case '<=' : case '>'  : case '>=' :
                    case 'lt' : case 'le' : case 'gt' : case 'ge' :
                    case '<=>': case 'cmp':

                    // Maths
                    case '+'  : case '-'  : case '*'  : case '/'  : case '%':

                    // String
                    case '.' :
                    case 'x' :

                    // Assignment
                    case '='  :
                        yield { type : 'BINOP', token : token }
                        break;

                    // =========================================================
                    // Builins
                    // =========================================================
                    // Many keywords function as unary operators, so
                    // we do that here, and worry about problems later.
                    // For which we have the KEYWORD type.
                    // ---------------------------------------------------------

                    // polymorphic
                    case 'defined' :
                    case 'reverse' :
                    case 'length'  :

                    // arrays
                    case 'pop'   :
                    case 'shift' :

                    // Hashes
                    case 'keys'   :
                    case 'values' :

                    // numbers
                    case 'abs'   :
                    case 'sin'   :
                    case 'cos'   :
                    case 'atan2' :
                    case 'sqrt'  :
                    case 'exp'   :
                    case 'log'   :
                    case 'hex'   :
                    case 'oct'   :
                    case 'rand'  :

                    // strings
                    case 'lc'      :
                    case 'lcfirst' :
                    case 'uc'      :
                    case 'ucfirst' :

                    // subroutines
                    case 'return'  :
                        yield { type : 'UNOP', token : token }
                        break;

                    // strings
                    case 'join'  :
                    case 'split' :

                    // arrays
                    case 'push'    :
                    case 'unshift' :

                    // hashes
                    case 'delete' :
                    case 'exists' :

                    // I/O
                    case 'say'   :
                    case 'print' :
                    case 'warn'  :
                    case 'die'   :
                        yield { type : 'LISTOP', token : token }
                        break;

                    // =========================================================
                    // Code Loading
                    // =========================================================
                    // We are starting with just

                    case 'require' :
                        yield { type : 'LISTOP', token : token }
                        break;

                    // =========================================================
                    // Variable Scoping
                    // =========================================================
                    // these are also resolved at compile time for the most part
                    // and affect where a variable gets read/written from.

                    case 'my'     :
                    case 'our'    :
                    case 'state'  :
                    case 'local'  :
                        yield { type : 'UNOP', token : token }
                        break;

                    // =========================================================
                    // Control structures
                    // =========================================================
                    // These are resolved at compile time to structure the
                    // opcode tree and code flow
                    // ---------------------------------------------------------
                    case 'if'      :
                    case 'unless'  :
                    case 'elsif'   :
                    case 'else'    :

                    case 'while'   :
                    case 'until'   :

                    case 'for'     :
                    case 'foreach' :

                    case 'try'     :
                    case 'catch'   :
                    case 'finally' :

                    case 'do'      :

                    case 'continue' :
                    case 'break'    :
                    case 'last'     :
                    case 'next'     :
                    case 'redo'     :
                        yield { type : 'CONTROL', token : token }
                        break;

                    // =========================================================
                    // Declaration Keywords
                    // =========================================================
                    // Keywords are resolved at compile time and will construct
                    // the symbol table for runtime
                    // ---------------------------------------------------------
                    case 'sub'     :
                    case 'package' :
                    case 'class'   :
                    case 'role'    :
                    case 'method'  :
                    case 'field'   :
                        yield { type : 'KEYWORD', token : token }
                        break;
                    // =========================================================
                    // No idea, so it is a Bareword ;)
                    // =========================================================
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

