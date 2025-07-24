
import { test } from "node:test"
import  assert  from "node:assert"

import { Console } from 'console';

import { Tokenizer, Token }     from '../Parser/Tokenizer'
import { Lexer, Lexed }     from '../Parser/Lexer'
import { TreeParser, ParseTree } from '../Parser/TreeParser'

// -----------------------------------------------------------------------------

export class ParserTestRunner {
    public tokenizer  : Tokenizer;
    public lexer      : Lexer;
    public treeParser : TreeParser;

    constructor () {
        this.tokenizer  = new Tokenizer();
        this.lexer      = new Lexer();
        this.treeParser = new TreeParser();
    }

    private *createSourceStream (source : string[]) : Generator<string, void, void> {
        for (const src of source) {
            yield src;
        }
    }

    run (testCases : ParserTestCase[]) : void {
        let caseNumber = 0;
        for (const testCase of testCases) {
            test(`... running test case number(${caseNumber})`, async (t) => {
                await t.test("... checking tokens", (t) => {
                    testCase.compareTokens(
                        this.tokenizer.run(
                            this.createSourceStream(testCase.source)));
                });

                await t.test("... checking lexer", (t) => {
                    testCase.compareLexer(
                        this.lexer.run(
                            this.tokenizer.run(
                                this.createSourceStream(testCase.source))));
                });

                await t.test("... checking parse tree", (t) => {
                    testCase.compareParseTree(
                        this.treeParser.run(
                            this.lexer.run(
                                this.tokenizer.run(
                                    this.createSourceStream(testCase.source)))));
                });
            });
            caseNumber++;
        }
    }
}

// -----------------------------------------------------------------------------

export class ParserTestCase {
    public config : any = { verbose : true };
    public output : any = defaultOutput;

    constructor(
        public source : string[],
        public tokens : Token[],
        public lexed  : Lexed[],
        public tree   : ParseTree[],
    ) {}

    private diag (...msg : any[]) : void {
        if (!this.config.verbose) return;
        this.output.log(...msg);
    }

    compareTokens(tokens : Generator<Token, void, void>) : void {
        let i = 0;
        for (const got of tokens) {
            this.diag('GOT      : ', got);
            this.diag('EXPECTED : ', this.tokens[i]);
            assert.deepStrictEqual(got, this.tokens[i], `... token(${i}) matches`);
            this.diag(`... token(${i}) matches`);
            i++;
        }
    }

    compareLexer(lexed : Generator<Lexed, void, void>) : void {
        let i = 0;
        for (const got of lexed) {
            this.diag('GOT      : ', got);
            this.diag('EXPECTED : ', this.lexed[i]);
            assert.deepStrictEqual(got, this.lexed[i], `... lexed(${i}) matches`);
            this.diag(`... lexed(${i}) matches`);
            i++;
        }
    }

    compareParseTree(tree : Generator<ParseTree, void, void>) : void {
        let i = 0;
        for (const got of tree) {
            //logger.log(got);
            this.diag('GOT      : ', got);
            this.diag('EXPECTED : ', this.tree[i]);
            assert.deepStrictEqual(got, this.tree[i], `... tree(${i}) matches`);
            this.diag(`... tree(${i}) matches`);
            i++;
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





