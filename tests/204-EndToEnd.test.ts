import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

(1, 2 + 2, 3);
(1, (2 + 2), 3);
(1, (2 + 2), 3 * (4 - 5));

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let frame = interpreter.main.frames[0] as StackFrame;

    assert.deepStrictEqual(
        frame.stack,
        [
          { type: 'INT', value: 1 },
          { type: 'NUM', value: 4 },
          { type: 'INT', value: 3 },
          { type: 'INT', value: 1 },
          { type: 'NUM', value: 4 },
          { type: 'INT', value: 3 },
          { type: 'INT', value: 1 },
          { type: 'NUM', value: 4 },
          { type: 'NUM', value: -3 },
        ]
    );
});



