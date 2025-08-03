
import { test } from "node:test"
import  assert  from "node:assert"

import {
    SimpleTestRunner, TestResult
} from '../src/Opal/TestRunner/SimpleTestRunner'

test("... even/odd recusive predicate function test", async (t) => {

    await SimpleTestRunner([`

        sub is_even ($n) {
            if ($n <= 0) {
                return true;
            } else {
                return is_odd($n - 1);
            }
        }

        sub is_odd ($n) {
            if ($n <= 0) {
                return false;
            } else {
                return is_even($n - 1);
            }
        }

        say is_even(10);
        say is_odd(12);

    `], (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0],
            "1",
            '... got the correct is_even(10)'
        );

        assert.strictEqual(
            result.output.buffer[1],
            "",
            '... got the correct is_odd(12)'
        );
    })
})


