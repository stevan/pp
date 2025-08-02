import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Block, ConstUndef,
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { IV } from '../src/Runtime/API'
import { Pad, StackFrame } from '../src/Runtime'
import { Interpreter } from '../src/Interpreter'

/*

my $x = 1;
my $y;
{
   my $x = 10;
   $y = $x;
}

*/

let RUN = new Program([
    new Statement(
        new ScalarDeclare('x', new ConstInt(1))),
    new Statement(
        new ScalarDeclare('y', new ConstUndef())),
    new Statement(
        new Block([
            new Statement(
                new ScalarDeclare('x', new ConstInt(10))),
            new Statement(
                new ScalarStore('y', new ScalarFetch('x'))),
        ])
    )
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

    assert.ok(pad.has('x'));
    assert.ok(pad.has('y'));

    let x = pad.get('x') as IV;
    let y = pad.get('y') as IV;

    assert.strictEqual(x.value, 1);
    assert.strictEqual(y.value, 10);
});
