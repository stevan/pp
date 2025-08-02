import { test } from "node:test"
import  assert  from "node:assert"


import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

sub is_even ($n) {
    if ($n <= 0) {
        return true;
    } else {
        return is_odd($n - 1);
    }
}

sub is_odd ($n) {
    if ($n <= 0) {
        return false;
    } else {
        return is_even($n - 1);
    }
}

say is_even(10);

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "1");
});



