
import { test } from "node:test"
import  assert  from "node:assert"

import { Console } from 'console';

import { Tokenizer, Token }      from '../Parser/Tokenizer'
import { Lexer, Lexed }          from '../Parser/Lexer'
import {
    TreeParser,
    ParseTree,
    ExpressionKind,
    newExpression,
} from '../Parser/TreeParser'

// -----------------------------------------------------------------------------

export class ParserTestRunner {
    public tokenizer  : Tokenizer;
    public lexer      : Lexer;

    constructor () {
        this.tokenizer = new Tokenizer();
        this.lexer     = new Lexer();
    }

    private *createSourceStream (source : string[]) : Generator<string, void, void> {
        for (const src of source) {
            yield src;
        }
    }

    run (testCases : ParserTestCase[]) : void {
        for (const testCase of testCases) {
            let treeParser = new TreeParser(testCase.config);
            testCase.compareParseTree(
                treeParser.run(
                    this.lexer.run(
                        this.tokenizer.run(
                            this.createSourceStream(testCase.source)))));
        }
    }
}

// -----------------------------------------------------------------------------

export class ParserTestCase {
    public output : any = defaultOutput;

    constructor(
        public name   : string,
        public source : string[],
        public tree   : ParseTree[],
        public config : any = { verbose : false, develop : false }
    ) {}

    private diag (...msg : any[]) : void {
        if (!this.config.develop) return;
        this.output.log(...msg);
    }

    compareParseTree(tree : Generator<ParseTree, void, void>) : void {
        if (this.tree.length == 0 || this.config.develop) {
            this.diag('Development Mode: here is what you got ...');
            let i = 0;
            for (const got of tree) {
                this.diag(i.toString().padStart(3, '0'), '->', got);
                i++;
            }
        }
        else {
            test(`compareParseTree for (${this.name})`, (t) => {
                let i = 0;
                for (const got of tree) {
                    //logger.log(got);
                    this.diag('GOT      : ', got);
                    this.diag('EXPECTED : ', this.tree[i]);
                    assert.deepStrictEqual(got, this.tree[i], `... tree(${i}) matches`);
                    this.diag(`... tree(${i}) matches`);
                    i++;
                }
            })
        }
    }
}

// -----------------------------------------------------------------------------

export const defaultOutput = new Console({
    stdout         : process.stdout,
    stderr         : process.stderr,
    inspectOptions : {
        depth       : Infinity,
        breakLength : Infinity,
    },
});

// -----------------------------------------------------------------------------
// Some util functions for testing
// -----------------------------------------------------------------------------

export const MockStatement = (body : ParseTree[]) : ParseTree => {
    return newExpression(ExpressionKind.STATEMENT, MockTerminator(), body);
}

export const MockTerminator = () : Lexed => {
    return { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' }} as Lexed
}

export const MockLiteral = (literalType : any, source : string) : Lexed => {
    return { type: 'LITERAL', token: { type: literalType, source: source }} as Lexed
}

export const MockBinOp = (source : string) : Lexed => {
    return { type: 'BINOP', token: { type: 'ATOM', source: source }} as Lexed
}

export const MockUnOp = (source : string) : Lexed => {
    return { type: 'UNOP', token: { type: 'ATOM', source: source }} as Lexed
}

export const MockIdentifier = (source : string) : Lexed => {
    return { type : 'IDENTIFIER', token : { type : 'ATOM', source : source }} as Lexed
}

export const MockKeyword = (source : string) : Lexed => {
    return { type : 'KEYWORD', token : { type : 'ATOM', source : source }} as Lexed
}

// -----------------------------------------------------------------------------


