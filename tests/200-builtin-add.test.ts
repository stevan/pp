import { test } from "node:test"
import  assert  from "node:assert"

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

my $x = 1;
my $y = 2;
my $z = $x + $x + $y + $x + $y + $x + $y + $x + $y;

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let frame = interpreter.main.frames[0] as StackFrame;
    let pad   = frame.padlist.at(-1)  as Pad;

    assert.ok(pad.has('x'));
    assert.ok(pad.has('y'));
    assert.ok(pad.has('z'));

    let x = pad.get('x') as IV;
    let y = pad.get('y') as IV;
    let z = pad.get('z') as IV;

    assert.strictEqual(x.value, 1);
    assert.strictEqual(y.value, 2);
    assert.strictEqual(z.value, 13);
});



