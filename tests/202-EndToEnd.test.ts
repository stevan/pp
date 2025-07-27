import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

123;
1234567890198;
0.001;
55.003;

'hello';
"hello world";

true;
false;
undef;

`], {
    verbose : false,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let frame = interpreter.main.frames[0] as StackFrame;

    assert.deepStrictEqual(
        frame.stack,
        [
          { type: 'INT',   value: 123 },
          { type: 'INT',   value: 1234567890198 },
          { type: 'NUM',   value: 0.001 },
          { type: 'NUM',   value: 55.003 },
          { type: 'STR',   value: 'hello' },
          { type: 'STR',   value: 'hello world' },
          { type: 'TRUE',  value: true },
          { type: 'FALSE', value: false },
          { type: 'UNDEF', value: undefined }
        ]
    );
});



