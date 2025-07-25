import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobDeclare, GlobFetch
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { IV, GlobSlot } from '../src/Runtime/API'
import { Pad, StackFrame } from '../src/Runtime'
import { Interpreter } from '../src/Interpreter'

/*

our $foo = 10;
my $bar = $foo;

*/

let RUN = new Program([
    new Statement(
        new GlobDeclare(
            new GlobVar('foo', GlobSlot.SCALAR),
            new ConstInt(10)
        )
    ),
    new Statement(
        new ScalarDeclare(
            'bar',
            new GlobFetch('foo', GlobSlot.SCALAR)
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

    assert.ok(pad.has('bar'));

    let bar = pad.get('bar') as IV;

    assert.strictEqual(bar.value, 10);
});


