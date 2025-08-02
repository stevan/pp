import { test } from "node:test"
import  assert  from "node:assert"


import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

sub fact ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * fact( $n - 1 );
    }
}

say fact(10);

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "3628800");
});



