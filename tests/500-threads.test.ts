
import { test } from "node:test"
import  assert  from "node:assert"

import {
    logger,
    prettyPrinter,
} from '../src/Opal/Tools'

import { InputSource, InputStream } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'
import { Compiler } from '../src/Opal/Compiler'
import { Interpreter } from '../src/Opal/Interpreter'
import { TestOutput } from '../src/Opal/TestRunner/TestImage'

import {
    PRAGMA, OpTree
} from '../src/Opal/Runtime/API'

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

test('... testing by-hand interpreter thread usage', async (t) => {

    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter();

    let thread1 = new TestInput([`
        my $x = 10;
        say 'Thread 1 - Starting';
        while ($x > 0) {
            say 'Thread 1 - Got ' . $x;
            $x = $x - 1;
        }
        say 'Thread 1 - Completed';
    `]);

    let thread2 = new TestInput([`
        my $x = 10;
        say 'Thread 2 - Starting';
        while ($x > 0) {
            say 'Thread 2 - Got ' . $x;
            $x = $x - 1;
        }
        say 'Thread 2 - Completed';
    `]);

    let output = new TestOutput();

    let t1 = compiler.compile(await parser.parse(thread1) as AST.Program);
    let t2 = compiler.compile(await parser.parse(thread2) as AST.Program);

    await Promise.all([
        output.run(interpreter.spawn(t1 as OpTree)),
        output.run(interpreter.spawn(t2 as OpTree)),
    ]);

    assert.deepStrictEqual(
        output.flush().map((s) => s.trim()),
        [
          'Thread 1 - Starting',  'Thread 2 - Starting',
          'Thread 1 - Got 10',    'Thread 2 - Got 10',
          'Thread 1 - Got 9',     'Thread 2 - Got 9',
          'Thread 1 - Got 8',     'Thread 2 - Got 8',
          'Thread 1 - Got 7',     'Thread 2 - Got 7',
          'Thread 1 - Got 6',     'Thread 2 - Got 6',
          'Thread 1 - Got 5',     'Thread 2 - Got 5',
          'Thread 1 - Got 4',     'Thread 2 - Got 4',
          'Thread 1 - Got 3',     'Thread 2 - Got 3',
          'Thread 1 - Got 2',     'Thread 2 - Got 2',
          'Thread 1 - Got 1',     'Thread 2 - Got 1',
          'Thread 1 - Completed', 'Thread 2 - Completed'
        ],
        '... got the output ordered as expected'
    );

});


