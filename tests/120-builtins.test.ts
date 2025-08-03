
import { test } from "node:test"
import  assert  from "node:assert"

import {
    SimpleTestRunner, TestResult
} from '../src/Opal/TestRunner/SimpleTestRunner'

test("... basic say(LIST) test", async (t) => {

    await SimpleTestRunner([`

        my $x = 1;
        say 1, (1 + $x), ($x + (1 + $x));


    `], (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer,
            [ '1', '2' , '3'],
            '... got the correct output'
        );
    })
})

test("... basic say(w/ expressions) test", async (t) => {

    await SimpleTestRunner([`

        say 1 + 2;
        say 1 + 2 - 3;
        say 1 + (2 - 3);
        say (1 + 2) - 3;
        say (1 + 2) - (3 + 4);
        say ((1 + 2) - ((3 * 4) / 5));

    `], (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer,
            [ "3", "0", "0", "0", "-4", "1" ],
            '... got the correct output'
        );
    })
})

test("... basic say(LIST w/ expressions) test", async (t) => {

    await SimpleTestRunner([`

        say(1, 2 + 2, 3);
        say(1, (2 + 2), 3);
        say(1, (2 + 2), 3 * (4 - 5));

    `], (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer,
            ["1","4","3","1","4","3","1","4","-3"],
            '... got the correct output'
        );
    })
})

test("... basic say(join(LIST) test", async (t) => {

    await SimpleTestRunner([`

        my $x = 1;
        say join ', ', 1, (1 + $x), ($x + (1 + $x));

    `], (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer,
            ["1, 2, 3"],
            '... got the correct output'
        );
    })
})

