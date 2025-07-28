import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

say(1, 2 + 2, 3);
say(1, (2 + 2), 3);
say(1, (2 + 2), 3 * (4 - 5));

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "1");
    assert.strictEqual(strings[1]?.value, "4");
    assert.strictEqual(strings[2]?.value, "3");
    assert.strictEqual(strings[3]?.value, "1");
    assert.strictEqual(strings[4]?.value, "4");
    assert.strictEqual(strings[5]?.value, "3");
    assert.strictEqual(strings[6]?.value, "1");
    assert.strictEqual(strings[7]?.value, "4");
    assert.strictEqual(strings[8]?.value, "-3");
});



