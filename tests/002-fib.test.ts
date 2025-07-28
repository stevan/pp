import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

sub fib ($n) {
    if ($n < 2) {
        $n;
    } else {
        fib( $n - 1 ) + fib( $n - 2 );
    }
}

say fib(25);

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "75025");
});



