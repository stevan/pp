import { test } from "node:test"
import  assert  from "node:assert"

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

my $foo = 0;
if ($foo == 0) {
    $foo = 20;
} else {
    $foo = 10;
}

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let frame = interpreter.main.frames[0] as StackFrame;
    let pad   = frame.padlist.at(-1)  as Pad;

    assert.ok(pad.has('foo'));

    let foo = pad.get('foo') as IV;

    assert.strictEqual(foo.value, 20);
});


/*
TODO: add this

        if (0 == 0) { 1 } else { 3 }
        if (true) { false }
        if (0 == 0) { 11000 } else { 30 }
        unless (false) { true }
*/

