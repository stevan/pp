
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... who tests the tester", async (t) => {

    let img = new TestImage();
    await img.run(new TestInput([`
        use Test;

        pass('... pass');
        fail('... fail');
        ok(10 == 10, '... pass');
        ok(10 != 10, '... fail');
        ok(20 != 10, '... pass');
        is(200, 200, '... pass');
        is(200, 100, '... fail');
        isnt(200, 100, '... pass');

    `]), (result : TestResult) => {

        assert.deepStrictEqual(
            result.output.buffer,
            [
                "ok 1 ... pass",
                "not ok 2 ... fail",
                "ok 3 ... pass",
                "not ok 4 ... fail",
                "ok 5 ... pass",
                "ok 6 ... pass",
                "not ok 7 ... fail",
                "# Failed test ... fail",
                "#        got: 200",
                "#   expected: 100",
                "ok 8 ... pass",
            ],
            '... got the correct output'
        );
    })
})


