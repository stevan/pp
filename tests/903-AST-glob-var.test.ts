import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarDeclare,
    ConstInt,
    GlobVar, GlobDeclare, GlobFetch
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

let DEBUG = false;

let compiler = new Compiler();

if (DEBUG) logger.log('... compiling RUN');
let runtime  = compiler.compile(RUN);

if (DEBUG) logger.group('DEPARSE/RUN:');
if (DEBUG) logger.log(RUN.deparse());
if (DEBUG) logger.groupEnd();

if (DEBUG) logger.group('RUN/EXEC:');
if (DEBUG) walkExecOrder(prettyPrinter, runtime.enter);
if (DEBUG) logger.groupEnd();

if (DEBUG) logger.group('RUN/WALK:');
if (DEBUG) walkTraversalOrder(prettyPrinter, runtime.leave);
if (DEBUG) logger.groupEnd();

let interpreter = new Interpreter({ DEBUG : false });

if (DEBUG) logger.group('RUN/INTERPRET:');
if (DEBUG) logger.time('RUN elapased');
interpreter.run(runtime);
if (DEBUG) logger.timeEnd('RUN elapased');
if (DEBUG) logger.groupEnd();

test("... simple AST test", (t) => {
    let frame = interpreter.main.frames[0] as StackFrame;
    let pad   = frame.padlist.at(-1)  as Pad;

    assert.ok(pad.has('bar'));

    let bar = pad.get('bar') as IV;

    assert.strictEqual(bar.value, 10);
});


