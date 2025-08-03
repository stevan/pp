
import { test } from "node:test"
import  assert  from "node:assert"

import {
    SimpleTestRunner, TestResult
} from '../src/Opal/TestRunner/SimpleTestRunner'

test("... greatest common divisor function test", async (t) => {

    await SimpleTestRunner([`

        sub gcd ($a, $b) {
            if ($b == 0) {
                return $a;
            } else {
                return gcd($b, $a % $b);
            }
        }

        say gcd(75025, 46368);

    `], (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0],
            "1",
            '... got the correct gcd for 75025 and 46368'
        )
    })
})


