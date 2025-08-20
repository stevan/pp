
import { test } from "node:test"
import  assert  from "node:assert"

import {
    logger,
    prettyPrinter,
} from '../src/Opal/Tools'

import { walkExecOrder, walkTraversalOrder } from '../src/Opal/Compiler/OpTreeWalker'

import { InputSource, InputStream } from '../src/Opal/Types'
import { Tokenizer, Token, newToken } from '../src/Opal/Parser/Tokenizer'
import { Parser } from '../src/Opal/Parser'
import { Compiler } from '../src/Opal/Compiler'
import { Interpreter } from '../src/Opal/Interpreter'
import { Linker } from '../src/Opal/Runtime/Linker'
import { Single } from '../src/Opal/Runtime/Tape'

import * as AST from '../src/Opal/Parser/AST'

export class TestInput implements InputSource {
    constructor(public source : string[]) {}

    async *run() : InputStream {
        let i = 0;
        while (i < this.source.length) {
            yield this.source[i] as string;
            i++;
        }
    }
}

// -----------------------------------------------------------------------------

export type Unknown  = { type: 'UNKNOWN' }
export type Known    = { type: 'KNOWN', value: Token }
export type Conflict = { type: 'CONFLICT', values: [ Token, Token ] }

export type Perhaps  = Unknown | Known | Conflict

// Type guards
export function isUnknown   (s: Perhaps): s is Unknown  { return s.type === 'UNKNOWN' }
export function isKnown     (s: Perhaps): s is Known    { return s.type === 'KNOWN' }
export function isConflict  (s: Perhaps): s is Conflict { return s.type === 'CONFLICT' }

// Constructors

export function Unknown () : Perhaps {
    return { type: 'UNKNOWN' }
}

export function Known (token: Token) : Perhaps {
    return { type: 'KNOWN', value: token }
}

export function Conflict (a: Token, b: Token) : Perhaps {
    return { type: 'CONFLICT', values : [ a, b ] }
}

// -----------------------------------------------------------------------------

export type Expression =
    | { type : 'TERM',  value : Token }
    | { type : 'UNOP',  operator : Token, operand : Expression }
    | { type : 'BINOP', operator : Token, lhs : Expression, rhs : Expression }

// -----------------------------------------------------------------------------

export abstract class ExpressionLattice {
    public version : number = 1;

    abstract isUnknown  () : boolean;
    abstract isKnown    () : boolean;
    abstract isConflict () : boolean;

    abstract merge (possibility: Perhaps) : void;

    abstract resolve () : Expression;

    join (a : Perhaps, b : Perhaps) : Perhaps {
        if (isConflict(a) || isConflict(b)) return isConflict(a) ? a : b;
        if (isUnknown(a)) return b;
        if (isUnknown(b)) return a;
        if (isKnown(a) && isKnown(b)) {
            if (a.value === b.value) return a;
            return Conflict(a.value, b.value);
        }
        throw new Error("Invalid lattice elements");
    }

    equals (a : Perhaps, b : Perhaps) : boolean {
        if (isConflict(a) && isConflict(b)) {
            // Order of values doesn't matter for equality
            return (a.values[0] === b.values[0] && a.values[1] === b.values[1]) ||
                   (a.values[0] === b.values[1] && a.values[1] === b.values[0]);
        }
        if (isUnknown(a) && isUnknown(b)) return true;
        if (isKnown(a)   && isKnown(b))   return a.value === b.value;
        return false;
    }
}

// -----------------------------------------------------------------------------

export class TermLattice extends ExpressionLattice {
    constructor(public term : Perhaps) { super() }

    isUnknown  () : boolean { return   isUnknown(this.term) }
    isKnown    () : boolean { return     isKnown(this.term) }
    isConflict () : boolean { return  isConflict(this.term) }

    merge (possibility: Perhaps) : void {
        const result = this.join(this.term, possibility);
        if (!this.equals(result, this.term)) {
            this.term = result;
            this.version++;
        }
    }

    resolve () : Expression {
        if (isKnown(this.term)) {
            return { type : 'TERM', value : this.term.value }
        }
        throw new Error('Term is in conflict of unknown');
    }
}

// -----------------------------------------------------------------------------

export class UnaryOpLattice extends ExpressionLattice {
    constructor(
        public operator : Perhaps,
        public operand  : ExpressionLattice
    ) { super() }

    isUnknown  () : boolean { return   isUnknown(this.operator) || this.operand.isUnknown()  }
    isKnown    () : boolean { return     isKnown(this.operator) && this.operand.isKnown()    }
    isConflict () : boolean { return  isConflict(this.operator) || this.operand.isConflict() }

    mergeOperator (possibility: Perhaps) : void {
        const result = this.join(this.operator, possibility);
        if (!this.equals(result, this.operator)) {
            this.operator = result;
            this.version++;
        }
    }

    mergeOperand (possibility: Perhaps) : void {
        this.operand.merge(possibility);
    }

    merge (possibility: Perhaps) : void {
        if (isUnknown(this.operator)) {
            this.mergeOperator(possibility)
        } else {
            this.mergeOperand(possibility)
        }
    }

    resolve () : Expression {
        if (isKnown(this.operator)) {
            return {
                type     : 'UNOP',
                operator : this.operator.value,
                operand  : this.operand.resolve(),
            }
        }
        throw new Error('Unable to resolve UnaryOpLattice');
    }
}

// -----------------------------------------------------------------------------

export class BinaryOpLattice extends ExpressionLattice {
    constructor(
        public operator : Perhaps,
        public lhs      : ExpressionLattice,
        public rhs      : ExpressionLattice
    ) { super() }

    isUnknown  () : boolean { return   isUnknown(this.operator) || this.lhs.isUnknown()  || this.rhs.isUnknown()  }
    isKnown    () : boolean { return     isKnown(this.operator) && this.lhs.isKnown()    && this.rhs.isKnown()    }
    isConflict () : boolean { return  isConflict(this.operator) || this.lhs.isConflict() || this.rhs.isConflict() }

    mergeOperator (possibility: Perhaps) : void {
        const result = this.join(this.operator, possibility);
        if (!this.equals(result, this.operator)) {
            this.operator = result;
            this.version++;
        }
    }

    mergeLeftHandSide (possibility: Perhaps) : void {
        this.lhs.merge(possibility);
    }

    mergeRightHandSide (possibility: Perhaps) : void {
        this.rhs.merge(possibility);
    }

    merge (possibility: Perhaps) : void {
        if (isUnknown(this.operator)) {
            this.mergeOperator(possibility)
        } else if (this.lhs.isUnknown()) {
            this.mergeLeftHandSide(possibility)
        } else {
            this.mergeRightHandSide(possibility)
        }
    }

    resolve () : Expression {
        if (isKnown(this.operator)) {
            return {
                type     : 'BINOP',
                operator : this.operator.value,
                lhs      : this.lhs.resolve(),
                rhs      : this.rhs.resolve(),
            }
        }
        throw new Error('Unable to resolve BinaryOpLattice');
    }
}

// -----------------------------------------------------------------------------

const test001 = async () => {

    let tokenizer = new Tokenizer();

    let source = new TestInput([`

        use v5.40;
        use Test;

        lc "foo";

        add 10 20;

    `]);


    let result : Expression[] = [];
    let stack  : ExpressionLattice[] = [];
    for await (const token of tokenizer.run(source.run())) {
        logger.log('GOT', token);
        switch (token.type) {
        case 'STRING':
        case 'NUMBER':
        case 'ATOM':
            switch (token.source) {
            case ';':
                logger.log('... got statement terminator');
                result.push((stack.pop() as ExpressionLattice).resolve());
                break;
            case 'use':
                logger.log('... got `use` UNOP');
                stack.push(new UnaryOpLattice(
                    Known(token),
                    new TermLattice(Unknown())
                ));
                break;
            case 'lc':
                logger.log('... got `lc` UNOP');
                stack.push(new UnaryOpLattice(
                    Known(token),
                    new TermLattice(Unknown())
                ));
                break;
            case 'add':
                logger.log('... got `add` UNOP');
                stack.push(new BinaryOpLattice(
                    Known(token),
                    new TermLattice(Unknown()),
                    new TermLattice(Unknown()),
                ));
                break;
            default:
                logger.log('... got token');
                (stack.at(-1) as ExpressionLattice).merge(Known(token));
            }
            break;
        case 'EOF':
            logger.log('... got EOF');
            break;
        default:
            throw new Error(`Unhandled token type(${token.type})`);
        }
    }


    logger.log('STACK', stack);
    logger.log('RESULT', result);

};

test001();


/*

{
    type : 'EXPRESSION',
    kind : 'STATEMENT',
    toke : { type : 'ATOM', source : ';' }
    body : {
        type : 'EXPRESSION',
        kind : 'UNOP',
        toke : { type : 'ATOM', source : 'use' },
        rest : {
            type : 'TERM',
            kind : 'VSTRING',
            toke : { type : 'ATOM', source : 'v5.40' }
        }
    }
}

{
    type : 'EXPRESSION',
    kind : 'STATEMENT',
    toke : { type : 'ATOM', source : ';' }
    body : {
        type : 'EXPRESSION',
        kind : 'UNOP',
        toke : { type : 'ATOM', source : 'use' },
        rest : {
            type : 'TERM',
            kind : 'BAREWORD',
            toke : { type : 'ATOM', source : 'Foo' }
        }
    }
}

{
    type : 'EXPRESSION',
    kind : 'DECLARATION',
    toke : { type : 'ATOM', source : 'sub' }
    body : [
        // name
        {
            type : 'TERM',
            kind : 'BAREWORD',
            toke : { type : 'ATOM', source : 'ident' }
        },
        // args
        {
            type : 'EXPRESSION',
            kind : 'LIST',
            toke : [ { type : 'ATOM', source : '(' }, { type : 'ATOM', source : ')' } ],
            body : [
                {
                    type : 'TERM',
                    kind : 'IDENTIFIER',
                    toke : { type : 'ATOM', source : '$x' }
                }
            ]
        },
        // body
        {
            type : 'EXPRESSION',
            kind : 'BLOCK',
            body : [
                {
                    type : 'EXPRESSION',
                    kind : 'STATEMENT',
                    toke : { type : 'ATOM', source : ';' }
                    body : {
                        type : 'EXPRESSION',
                        kind : 'UNOP',
                        toke : { type : 'ATOM', source : 'return' },
                        rest : {
                            type : 'TERM',
                            kind : 'IDENTIFIER',
                            toke : { type : 'ATOM', source : '$x' }
                        }
                    }
                }
            ]
        }
    ]
}

*/



