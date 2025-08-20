
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
    | { type : 'TERM', value : Token }
    | { type : 'OPERATOR', operator : Token, operands : Expression[] }

// -----------------------------------------------------------------------------

export abstract class ExpressionLattice {
    public version : number = 1;

    abstract isUnknown  () : boolean;
    abstract isKnown    () : boolean;
    abstract isConflict () : boolean;

    //abstract merge (possibility: Perhaps) : void;

    abstract resolve () : Expression;
}

// -----------------------------------------------------------------------------

export class TermLattice extends ExpressionLattice {
    constructor(public term : Perhaps) { super() }

    isUnknown  () : boolean { return   isUnknown(this.term) }
    isKnown    () : boolean { return     isKnown(this.term) }
    isConflict () : boolean { return  isConflict(this.term) }

    resolve () : Expression {
        if (isKnown(this.term)) {
            return { type : 'TERM', value : this.term.value }
        }
        throw new Error('Term is in conflict of unknown');
    }
}

// -----------------------------------------------------------------------------

export class OperatorLattice extends ExpressionLattice {
    constructor(
        public arity    : number,
        public operator : Perhaps,
        public operands : ExpressionLattice[] = [],
    ) { super() }

    isUnknown () : boolean {
        return isUnknown(this.operator)
            || this.operands.findIndex((l) => l.isUnknown()) != -1;
    }

    isKnown () : boolean {
        return isKnown(this.operator)
            && this.operands.every((l) => l.isKnown());
    }

    isConflict () : boolean {
        return isConflict(this.operator)
            || this.operands.findIndex((l) => l.isConflict()) != -1
    }

    resolve () : Expression {
        if (isKnown(this.operator)) {
            return {
                type     : 'OPERATOR',
                operator : this.operator.value,
                operands : this.operands.map((o) => o.resolve()),
            }
        }
        throw new Error('Unable to resolve UnaryOpLattice');
    }
}

// -----------------------------------------------------------------------------

const test001 = async () => {

    let tokenizer = new Tokenizer();

    let source = new TestInput([`

        binop 10 20;
        unop unop 20;

        binop 10 unop 20;
        binop unop 20 10;

        ternop 10 20 30;

        ternop binop 10 unop 20 30;

    `]);

    let result : ExpressionLattice[] = [];
    let stack  : ExpressionLattice[] = [];
    let opers  : OperatorLattice[]   = [];
    for await (const token of tokenizer.run(source.run())) {
        logger.log('---------------------------------------------------------');
        logger.log('GOT', token);
        logger.log('STACK(before)', stack);
        logger.log('OPERS(before)', opers);
        switch (token.type) {
        case 'STRING':
        case 'NUMBER':
            logger.log(`... got (${token.source}) ${token.type}`);
            let term = new TermLattice(Known(token));
            if (opers.length > 0) {
                logger.log('...adding term to the top of OPER stack');
                let op   = opers.at(-1) as OperatorLattice;
                if (op == undefined) throw new Error('Execpted operation!');
                op.operands.push(term);
                if (op.operands.length == op.arity) {
                    opers.pop();
                }
            } else {
                logger.log('...adding term to top of stack');
                stack.push(term);
            }
            break;
        case 'ATOM':
            switch (token.source) {
            case ';':
                logger.log('... got statement terminator');
                result.push(stack.pop() as ExpressionLattice);
                break;
            case 'ternop':
                logger.log(`... got (${token.source}) TERNOP`);
                let ternop = new OperatorLattice(3, Known(token));
                if (opers.length > 0) {
                    logger.log('...adding ternop to the top of OPER stack');
                    let op   = opers.at(-1) as OperatorLattice;
                    if (op == undefined) throw new Error('Execpted operation!');
                    op.operands.push(ternop);
                    if (op.operands.length == op.arity) {
                        opers.pop();
                    }
                } else {
                    logger.log('...adding ternop to the top of stack');
                    stack.push(ternop);
                }
                opers.push(ternop);
                break;
            case 'binop':
                logger.log(`... got (${token.source}) BINOP`);
                let binop = new OperatorLattice(2, Known(token));
                if (opers.length > 0) {
                    logger.log('...adding binop to the top of OPER stack');
                    let op   = opers.at(-1) as OperatorLattice;
                    if (op == undefined) throw new Error('Execpted operation!');
                    op.operands.push(binop);
                    if (op.operands.length == op.arity) {
                        opers.pop();
                    }
                } else {
                    logger.log('...adding binop to the top of stack');
                    stack.push(binop);
                }
                opers.push(binop);
                break;
            case 'unop':
                logger.log(`... got (${token.source}) UNOP`);
                let unop = new OperatorLattice(1, Known(token));
                if (opers.length > 0) {
                    logger.log('...adding unop to the top of OPER stack');
                    let op   = opers.at(-1) as OperatorLattice;
                    if (op == undefined) throw new Error('Execpted operation!');
                    op.operands.push(unop);
                    if (op.operands.length == op.arity) {
                        opers.pop();
                    }
                } else {
                    logger.log('...adding unop to the top of stack');
                    stack.push(unop);
                }
                opers.push(unop);
                break;
            default:
                throw new Error(`Unknown Atom (${token.source})`);
            }
            break;
        case 'EOF':
            logger.log('... got EOF');
            break;
        default:
            throw new Error(`Unhandled token type(${token.type})`);
        }
        logger.log('OPERS(after)', opers);
        logger.log('STACK(after)', stack);
        logger.log('---------------------------------------------------------');
    }


    logger.log('OPERS(end)', opers);
    logger.log('STACK(end)', stack);
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



