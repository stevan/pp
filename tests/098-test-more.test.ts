
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... who tests the tester", async (t) => {

    let img = new TestImage();

    await img.run([`

        our $count = 0;

        sub ok ($test, $count, $msg) {
            if ($test == true) {
                say join ' ', 'ok', $count, $msg;
            } else {
                say join ' ', 'not ok', $count, $msg;
            }
        }

        ok(10 == 10, 1, '... pass');


    `], (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0],
            "ok 1 ... pass",
            '... got the correct output'
        )
    })
})


