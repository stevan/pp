import { test } from "node:test"
import  assert  from "node:assert"


import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

test("... simple EndToEnd test", (t) => {
    let interpreter = EndToEndTestRunner([`

sub fib ($n) {
    if ($n < 2) {
        return $n;
    } else {
        return fib( $n - 1 ) + fib( $n - 2 );
    }
}

say fib(25);

    `], {
        verbose : false,
        quiet   : true,
    });

    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "75025");
});



