import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter } from '../src/Logger'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { Pad, IV } from '../src/Runtime'
import { Interpreter, StackFrame } from '../src/Interpreter'

/*

my $foo = 0;
if ($foo == 0) {
    $foo = 20;
} else {
    $foo = 10;
}

*/

let RUN = new Program([
    new Statement(
        new ScalarDeclare('foo', new ConstInt(0))
    ),
    new Statement(
        new Conditional(
            new Equal(
                new ScalarFetch('foo'),
                new ConstInt(0)
            ),
            new Block([
                new Statement(
                    new ScalarStore('foo', new ConstInt(20))
                ),
            ]),
            new Block([
                new Statement(
                    new ScalarStore('foo', new ConstInt(10))
                ),
            ])
        )
    )

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

let interpreter = new Interpreter();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime, { DEBUG : false });
logger.timeEnd('RUN elapased');
logger.groupEnd();

test("... simple AST test", (t) => {
    let frame = interpreter.frames[0] as StackFrame;
    let pad   = frame.padlist.at(-1)  as Pad;

    assert.ok(pad.has('foo'));

    let foo = pad.get('foo') as IV;

    assert.strictEqual(foo.value, 20);
});

