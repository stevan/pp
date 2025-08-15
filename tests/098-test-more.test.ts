
import { test } from "node:test"
import  assert  from "node:assert"

import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

test("... who tests the tester", async (t) => {

    let img = new TestImage([
        new TestInput([`
            my $count = 1;
            my $fails = 0;

            sub pass ($msg) {
                say join ' ', 'ok', $count, $msg;
                $count = $count + 1;
            }

            sub fail ($msg) {
                say join ' ', 'not ok', $count, $msg;
                $count = $count + 1;
                $fails = $fails + 1;
            }

            sub ok ($test, $msg) {
                if ($test == true) {
                    pass($msg);
                } else {
                    fail($msg);
                }
            }

            sub is ($got, $expected, $msg) {
                ok($got == $expected, $msg);
            }

            sub isnt ($got, $expected, $msg) {
                ok($got != $expected, $msg);
            }
        `])
    ]);

    await img.run([`

        pass('... pass');
        fail('... fail');
        ok(10 == 10, '... pass');
        ok(10 != 10, '... fail');
        ok(20 != 10, '... pass');
        is(200, 200, '... pass');
        is(200, 100, '... fail');
        isnt(200, 100, '... pass');

    `], (result : TestResult) => {

        assert.deepStrictEqual(
            result.output.buffer,
            [
                "ok 1 ... pass",
                "not ok 2 ... fail",
                "ok 3 ... pass",
                "not ok 4 ... fail",
                "ok 5 ... pass",
                "ok 6 ... pass",
                "not ok 7 ... fail",
                "ok 8 ... pass",
            ],
            '... got the correct output'
        );
    })
})


