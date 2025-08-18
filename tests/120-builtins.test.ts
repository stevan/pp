
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'


test("... basic say(LIST) test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`

        my $x = 1;
        say(1, (1 + $x), ($x + (1 + $x)));


    `]), (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer.map((s) => s.trim()),
            [ '123'],
            '... got the correct output'
        );
    })
})


test("... basic say(w/ expressions) test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`

        sub sayit () {
            say(1 + 2);
            say(1 + 2 - 3);
            say(1 + (2 - 3));
            say((1 + 2) - 3);
            say((1 + 2) - (3 + 4));
            say(((1 + 2) - ((3 * 4) / 5)));
        }

        sayit();

    `]), (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer.map((s) => s.trim()),
            [ "3", "0", "0", "0", "-4", "0.6000000000000001" ],
            '... got the correct output'
        );
    })
})


test("... basic say(LIST w/ expressions) test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`

        say(1, 2 + 2, 3);
        say(1, (2 + 2), 3);
        say(1, (2 + 2), 3 * (4 - 5));

    `]), (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer.map((s) => s.trim()),
            ["143","143","14-3"],
            '... got the correct output'
        );
    })
})

test("... basic say(join(LIST) test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`

        my $x = 1;
        say(join(', ', 1, (1 + $x), ($x + (1 + $x))));

    `]), (result : TestResult) => {
        assert.deepStrictEqual(
            result.output.buffer.map((s) => s.trim()),
            ["1, 2, 3"],
            '... got the correct output'
        );
    })
})

