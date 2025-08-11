
import { test } from "node:test"
import  assert  from "node:assert"

import { Tokenizer, TokenStream } from '../src/Opal/Parser/Tokenizer'
import { TestInput } from '../src/Opal/TestRunner/SimpleTestRunner'

async function captureTokenizerOuput (input : TokenStream) {
    let tokens = []
    for await (const token of input) {
        tokens.push(token);
    }
    return tokens;
}

let tokenizer = new Tokenizer();

test('... tokenizeing empty string', async (t) => {
    let input  = new TestInput([ '' ]);
    let tokens = await captureTokenizerOuput(tokenizer.run(input.run()));
    assert.strictEqual(tokens.length, 0, '... empty string returns no tokens');
});


test('... tokenizeing numbers', async (t) => {
    let source = [
        '1',
        '2.5',
        '1000',
        '100.345',
        '-25',
        '-0.1222',
        '10_000',
        '12344556698.000000087387'
    ];

    for (const input of [
        new TestInput([ ...source ]),
        new TestInput([ source.join(' ')  ]),
        new TestInput([ source.join('\n') ]),
    ]) {
        let tokens = await captureTokenizerOuput(tokenizer.run(input.run()));
        assert.strictEqual(tokens.length, 8, '... got expected amount of tokens');
        assert.strictEqual(
            tokens.filter((t) => t.type == 'NUMBER').length,
            8,
        '... all tokens were numbers');
        assert.deepStrictEqual(
            tokens.map((t) => t.source),
            [
                '1', '2.5', '1000', '100.345', '-25', '-0.1222',
                '10_000', '12344556698.000000087387'
            ],
        '... got expected tokens');
    }
})


test('... tokenizeing strings', async (t) => {
    let source = [
        '"Hello"',
        '"Foo Bar Baz"',
        '"100"',
        `'single "quoted" string'`,
        "'foo\\n'",
    ];

    for (const input of [
        new TestInput([ ...source ]),
        new TestInput([ source.join(' ')  ]),
        new TestInput([ source.join('\n') ]),
    ]) {
        let tokens = await captureTokenizerOuput(tokenizer.run(input.run()));
        assert.strictEqual(tokens.length, 5, '... got expected amount of tokens');
        assert.strictEqual(
            tokens.filter((t) => t.type == 'STRING').length,
            5,
        '... all tokens were string');
        assert.deepStrictEqual(
            tokens.map((t) => t.source),
            [
                'Hello', 'Foo Bar Baz',
                '100',
                'single "quoted" string',
                'foo\\n'
            ],
        '... got expected tokens');
    }
})






















