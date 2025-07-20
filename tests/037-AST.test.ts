import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter } from '../src/Logger'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block,
    ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal, Say,
    SubDefinition, SubCall, SubReturn, SubBody,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { Pad, IV } from '../src/Runtime'
import { Interpreter, StackFrame } from '../src/Interpreter'

/*

sub adder ($n, $m) { return $n + $m }

my $x = adder(10, 20);

say ($x);

*/


let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'adder',
            [ 'n', 'm' ],
            [
                new Statement(
                    new SubReturn(
                        new Add(
                            new ScalarFetch('n'),
                            new ScalarFetch('m'),
                        )
                    )
                )
            ]
        )
    )
]);

let RUN = new Program([
    new Statement(
        new ScalarDeclare(
            'x',
            new Add(
                new SubCall(
                    new GlobFetch('adder', GlobSlot.CODE),
                    [ new ConstInt(10), new ConstInt(20) ]
                ),
                new SubCall(
                    new GlobFetch('adder', GlobSlot.CODE),
                    [ new ConstInt(5), new ConstInt(15) ]
                )
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

let interpreter = new Interpreter();

logger.group('BEGIN/INTERPRET:');
logger.time('BEGIN elapased');
interpreter.run(comptime);
logger.timeEnd('BEGIN elapased');
logger.groupEnd();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime, { DEBUG : false });
logger.timeEnd('RUN elapased');
logger.groupEnd();

test("... simple AST test", (t) => {
    let strings = interpreter.STD_buffer;

    assert.strictEqual(strings[0]?.value, "50");
});


