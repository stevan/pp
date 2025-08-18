
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... factorial function test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`
        sub fact ($n) {
            if ($n == 0) {
                return 1;
            } else {
                return $n * fact( $n - 1 );
            }
        }

        say(fact(10));
    `]), (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0]?.trim(),
            "3628800",
            '... got the correct value for fact(10)'
        )
    })
})


