
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... ??? test", async (t) => {

    let img = new TestImage();

    await img.run([`


    `], (result : TestResult) => {

        assert.strictEqual(
            result.output.buffer[0],
            "???",
            '... got the correct ???'
        );
    })
})


