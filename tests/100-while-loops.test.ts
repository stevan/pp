
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... simple while loop test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`

        my $x = 10;
        while ($x > 0) {
            $x = $x - 1;
            say $x;
        }

    `]), (result : TestResult) => {

        assert.deepStrictEqual(
            result.output.buffer,
            [ "9", "8", "7", "6", "5", "4", "3", "2", "1", "0" ],
            '... got the correct output'
        );
    })
})


