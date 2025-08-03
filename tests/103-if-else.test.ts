
import { test } from "node:test"
import  assert  from "node:assert"

import {
    SimpleTestRunner, TestResult
} from '../src/Opal/TestRunner/SimpleTestRunner'

import { Pad, StackFrame }    from '../src/Opal/Runtime'
import { IV }                 from '../src/Opal/Runtime/API'

test("... basic if/else test", async (t) => {

    await SimpleTestRunner([`

        my $foo = 0;
        if ($foo == 0) {
            $foo = 20;
        } else {
            $foo = 10;
        }

    `], (result : TestResult) => {

        let frame = result.interpreter.main.frames[0] as StackFrame;
        let pad   = frame.padlist.at(-1)  as Pad;

        assert.ok(pad.has('foo'));

        let foo = pad.get('foo') as IV;

        assert.strictEqual(foo.value, 20);

    })
})


