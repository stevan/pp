
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

import { Pad, StackFrame }    from '../src/Opal/Runtime/StackFrame'
import { IV }                 from '../src/Opal/Runtime/API'

test("... basic if/else test", async (t) => {

    let img = new TestImage();

    await img.run(new TestInput([`

        my $foo = 0;
        if ($foo == 0) {
            $foo = 20;
        } else {
            $foo = 10;
        }

    `]), (result : TestResult) => {

        let frame = result.interpreter.main.frames[0] as StackFrame;
        let pad   = frame.padlist.at(-1)  as Pad;

        assert.ok(pad.has('foo'));

        let foo = pad.get('foo') as IV;

        assert.strictEqual(foo.value, 20);

    })
})


