import { Opal } from '../src/Opal'
import { test } from "node:test"
import  assert  from "node:assert"

test("... simple Opal test", (t) => {
    const opal = new Opal({ quiet: true });
    let interpreter = opal.run(
        [
            'my $x = 1;',
            'my $y = 2;',
            'say $x + $y;',
        ]
    );
    assert.deepStrictEqual(interpreter.STDOUT, ['3']);
});
