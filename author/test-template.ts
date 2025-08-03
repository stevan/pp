
import { test } from "node:test"
import  assert  from "node:assert"

import {
    SimpleTestRunner, TestResult
} from '../src/Opal/TestRunner/SimpleTestRunner'

test("... ??? test", async (t) => {

    await SimpleTestRunner([`


    `], (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0],
            "???",
            '... got the correct ???'
        );
    })
})


