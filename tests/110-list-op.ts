import { test } from "node:test"
import  assert  from "node:assert"


import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

test("... simple EndToEnd test", (t) => {
    let interpreter = EndToEndTestRunner([`

    my $x = 1;
    say 1, (1 + $x), ($x + (1 + $x));

    `], {
        verbose : false,
        quiet   : true,
    });

    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "1");
    assert.strictEqual(strings[1]?.value, "2");
    assert.strictEqual(strings[2]?.value, "3");
});

test("... simple EndToEnd test", (t) => {
    let interpreter = EndToEndTestRunner([`

        say 1 + 2;
        say 1 + 2 - 3;
        say 1 + (2 - 3);
        say (1 + 2) - 3;
        say (1 + 2) - (3 + 4);
        say ((1 + 2) - ((3 * 4) / 5));

    `], {
        verbose : false,
        quiet   : true,
    });


    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "3");
    assert.strictEqual(strings[1]?.value, "0");
    assert.strictEqual(strings[2]?.value, "0");
    assert.strictEqual(strings[3]?.value, "0");
    assert.strictEqual(strings[4]?.value, "-4");
    assert.strictEqual(strings[5]?.value, "1");
});


test("... simple EndToEnd test", (t) => {
    let interpreter = EndToEndTestRunner([`

    say(1, 2 + 2, 3);
    say(1, (2 + 2), 3);
    say(1, (2 + 2), 3 * (4 - 5));

    `], {
        verbose : false,
        quiet   : true,
    });

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


test("... simple EndToEnd test", (t) => {
    let interpreter = EndToEndTestRunner([`

    my $x = 1;
    say join ', ', 1, (1 + $x), ($x + (1 + $x));

    `], {
        verbose : false,
        quiet   : true,
    });


    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "1, 2, 3");
});


