
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... fibonacci function test", async (t) => {

    let img = new TestImage();

    await img.run([`

        sub fib ($n) {
            if ($n < 2) {
                return $n;
            } else {
                return fib( $n - 1 ) + fib( $n - 2 );
            }
        }

        say fib(25);

    `], (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0],
            "75025",
            '... got the correct value for fib(25)'
        )
    })
})


