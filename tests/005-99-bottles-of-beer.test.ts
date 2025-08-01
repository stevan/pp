import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

test("... simple EndToEnd test", (t) => {
    let interpreter = EndToEndTestRunner([`

my $num = 99;
while ($num > 0) {

    my $s = '';
    unless ($num == 1) {
        $s = 's';
    }

    say $num . " bottle" . $s . " of beer on the wall, " . $num . " bottle" . $s . " of beer";

    $num = $num - 1;

    unless ($num == 1) {
        $s = 's';
    }

    if ($num == 0) {
        say "No more";
    } else {
        say "Take one down, pass it around, " . $num . " bottle" . $s . " of beer on the wall";
    }
}

say "No more bottles of beer on the wall, no more bottles of beer.";
say "Go to the store and buy some more, 99 bottles of beer on the wall.";

    `], {
        verbose : false,
        quiet   : true,
    });

    let frame   = interpreter.main.frames[0] as StackFrame;
    let strings = interpreter.main.STD_buffer;

    let count = 99;
    for (let i = 0; i < strings.length - 4; i += 2) {
        assert.notStrictEqual(strings[i + 0]?.value.indexOf(count.toString()), -1, `${count} is in string(${strings[i]?.value})`);
        count--;
        assert.notStrictEqual(strings[i + 1]?.value.indexOf(count.toString()), -1, `${count} is in string(${strings[i+1]?.value})`);
    }

    let offset = strings.length - 3;
    assert.strictEqual(
        strings[offset]?.value,
        "No more"
    );
    offset++;
    assert.strictEqual(
        strings[offset]?.value,
        "No more bottles of beer on the wall, no more bottles of beer."
    );
    offset++;
    assert.strictEqual(
        strings[offset]?.value,
        "Go to the store and buy some more, 99 bottles of beer on the wall."
    );

});


