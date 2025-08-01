import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

my $x = 10;
while ($x > 0) {
    $x = $x - 1;
    say $x;
}

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "9");
    assert.strictEqual(strings[1]?.value, "8");
    assert.strictEqual(strings[2]?.value, "7");
    assert.strictEqual(strings[3]?.value, "6");
    assert.strictEqual(strings[4]?.value, "5");
    assert.strictEqual(strings[5]?.value, "4");
    assert.strictEqual(strings[6]?.value, "3");
    assert.strictEqual(strings[7]?.value, "2");
    assert.strictEqual(strings[8]?.value, "1");
});



