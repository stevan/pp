import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarDeclare, ScalarStore, ScalarFetch,
    ConstInt,
    Add,
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { Pad, IV, GlobSlot } from '../src/Runtime/API'
import { Interpreter, StackFrame } from '../src/Runtime'

/*
my $x = 1;
my $y = 2;
my $z = $x + $x + $y + $x + $y + $x + $y + $x + $y;
*/

let RUN = new Program([
    new Statement(
        new ScalarDeclare('x', new ConstInt(1))),
    new Statement(
        new ScalarDeclare('y', new ConstInt(2))),
    new Statement(
        new ScalarDeclare('z',
            new Add(
                new Add(
                    new ScalarFetch('x'),
                    new Add(
                        new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                        new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                    )
                ),
                new Add(
                    new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                    new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                )
            )
        )
    ),
]);


let compiler = new Compiler();

logger.log('... compiling RUN');
let runtime  = compiler.compile(RUN);

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('RUN/EXEC:');
walkExecOrder(prettyPrinter, runtime.enter);
logger.groupEnd();

logger.group('RUN/WALK:');
walkTraversalOrder(prettyPrinter, runtime.leave);
logger.groupEnd();

let interpreter = new Interpreter({ DEBUG : false });

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();

test("... simple AST test", (t) => {
    let frame = interpreter.main.frames[0] as StackFrame;
    let pad   = frame.padlist.at(-1)  as Pad;

    assert.ok(pad.has('x'));
    assert.ok(pad.has('y'));
    assert.ok(pad.has('z'));

    let x = pad.get('x') as IV;
    let y = pad.get('y') as IV;
    let z = pad.get('z') as IV;

    assert.strictEqual(x.value, 1);
    assert.strictEqual(y.value, 2);
    assert.strictEqual(z.value, 13);
});



