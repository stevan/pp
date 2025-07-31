import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { Pad, StackFrame }    from '../src/Runtime'
import { IV }                 from '../src/Runtime/API'
import { Interpreter }        from '../src/Interpreter'
import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let interpreter = EndToEndTestRunner([`

if (0 == 0) { 1 } else { 3 }

if (true) { false }

if (0 == 0) { 11000 } else { 30 }

unless (false) { true }


`], {
    verbose : true,
    quiet   : true,
});

test("... simple EndToEnd test", (t) => {
    let frame   = interpreter.main.frames[0] as StackFrame;
    let strings = interpreter.main.STD_buffer;

    logger.log(frame.stack);
});



