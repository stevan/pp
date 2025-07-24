
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
        for (const testCase of testCases) {
            test(`test case (${testCase.name})`, async (t) => {
                await t.test("... checking parse tree", (t) => {
                    testCase.compareParseTree(
                        this.treeParser.run(
                            this.lexer.run(
                                this.tokenizer.run(
                                    this.createSourceStream(testCase.source)))));
                });
            });
        }
    }
}

// -----------------------------------------------------------------------------

export class ParserTestCase {
    public config : any = { verbose : false };
    public output : any = defaultOutput;

    constructor(
        public name   : string,
        public source : string[],
        public tree   : ParseTree[],
    ) {}

    private diag (...msg : any[]) : void {
        if (!this.config.verbose) return;
        this.output.log(...msg);
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





