
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... 99 bottles of beer test", async (t) => {

    let img = new TestImage();

    await img.run([`

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


    `], (result : TestResult) => {

        let strings = result.output.buffer;

        let count = 99;
        for (let i = 0; i < strings.length - 4; i += 2) {
            assert.notStrictEqual(strings[i + 0]?.indexOf(count.toString()), -1, `${count} is in string(${strings[i]})`);
            count--;
            assert.notStrictEqual(strings[i + 1]?.indexOf(count.toString()), -1, `${count} is in string(${strings[i+1]})`);
        }

        let offset = strings.length - 3;
        assert.strictEqual(
            strings[offset],
            "No more"
        );
        offset++;
        assert.strictEqual(
            strings[offset],
            "No more bottles of beer on the wall, no more bottles of beer."
        );
        offset++;
        assert.strictEqual(
            strings[offset],
            "Go to the store and buy some more, 99 bottles of beer on the wall."
        );

    })
})


