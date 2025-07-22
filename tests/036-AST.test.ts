import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block,
    ConstUndef, GlobVar, GlobDeclare, GlobFetch,
    Conditional, Equal, Say,
    SubDefinition, SubCall, SubReturn, SubBody,
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { Pad, IV, GlobSlot } from '../src/Runtime/API'
import { Interpreter, StackFrame } from '../src/Runtime'


/*

sub add_one_and_two() { 1 + 2 }

add_one_and_two();

*/

let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'add_one_and_two',
            [],
            [
                new Statement(
                    new Add(
                        new ConstInt(1), new ConstInt(2)
                    )
                )
            ]
        )
    )
]);

let RUN = new Program([
    new Statement(
        new ScalarDeclare('x',
            new SubCall(
                new GlobFetch('add_one_and_two', GlobSlot.CODE),
                []
            )
        )
    ),
    new Statement(
        new Say([ new ScalarFetch('x') ])
    )
]);


let compiler = new Compiler();

logger.log('... compiling BEGIN');
let comptime = compiler.compile(BEGIN);
logger.log('... compiling RUN');
let runtime  = compiler.compile(RUN);

logger.group('DEPARSE/BEGIN:');
logger.log(BEGIN.deparse());
logger.groupEnd();

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('BEGIN/EXEC:');
walkExecOrder(prettyPrinter, comptime.enter);
logger.groupEnd();

logger.group('RUN/EXEC:');
walkExecOrder(prettyPrinter, runtime.enter);
logger.groupEnd();

logger.group('BEGIN/WALK:');
walkTraversalOrder(prettyPrinter, comptime.leave);
logger.groupEnd();

logger.group('RUN/WALK:');
walkTraversalOrder(prettyPrinter, runtime.leave);
logger.groupEnd();

let interpreter = new Interpreter({ DEBUG : false });

logger.group('BEGIN/INTERPRET:');
logger.time('BEGIN elapased');
interpreter.run(comptime);
logger.timeEnd('BEGIN elapased');
logger.groupEnd();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();

test("... simple AST test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "3");
});
