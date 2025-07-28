
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

function prettyPrintLexed(lexed: Lexed) : string {
    return `${lexed.type}['${lexed.token.source}', ${lexed.token.type}]`;
}

export function prettyPrintParseTree (tree: ParseTree, depth : number = 0) : string {
    let indent = "  ".repeat(depth);

    let out = '';
    switch (tree.type) {
    case 'TERM':
        out = `${indent}Term:${prettyPrintLexed(tree.value)}`;
        break;
    case 'APPLY':
        out = [
            `${indent}Apply(\n`,
                prettyPrintParseTree(tree.value, depth + 1),
                prettyPrintParseTree(tree.args, depth + 1),
            `${indent})`
            ].join('');
        break;
    case 'SLICE':
        out = [
            `${indent}Slice(\n`,
                prettyPrintParseTree(tree.value, depth + 1),
                prettyPrintParseTree(tree.slice, depth + 1),
            `${indent})`
            ].join('');
        break;
    case 'OPERATION':
        out = [
            `${indent}Operation(\n`,
                `${indent}  ${prettyPrintLexed(tree.operator)}\n`,
                tree.operands.map((o) => prettyPrintParseTree(o, depth + 1)).join(''),
            `${indent})`
            ].join('')
        break;
    case 'EXPRESSION':
        out = [
            `${indent}Expression:${tree.kind}[${tree.lexed.map((o) => `'${o.token.source}'`).join(' ')}](\n`,
                tree.stack.map((o) => prettyPrintParseTree(o, depth + 1)).join(''),
                tree.other.map((o) => prettyPrintParseTree(o, depth + 1)).join(''),
            `${indent})`
            ].join('')
        break;
    default:
        throw new Error(`Unknown ParseTree type ${JSON.stringify(tree)}`);
    }

    return out + "\n";
}

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
            if (this.config.pretty_print) {
                this.diag('-'.repeat(80));
                this.diag('# SOURCE:');
                this.diag('-'.repeat(80));
                let line_num = 0;
                this.source.forEach((s) => {
                    this.diag(
                        s.split("\n")
                            .map((l) => `# ${(++line_num).toString().padStart(3, '0')}: ${l}`)
                            .join('\n')
                    );
                });
            }
            let i = 0;
            for (const got of tree) {
                if (this.config.pretty_print) {
                    this.diag('-'.repeat(80));
                    this.diag(`# STATEMENT : ${i.toString().padStart(3, '0')}`);
                    this.diag(prettyPrintParseTree(got));
                    this.diag('-'.repeat(80));
                } else {
                    this.diag(i.toString().padStart(3, '0'), '->', got);
                }
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


