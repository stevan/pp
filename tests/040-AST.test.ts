import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter } from '../src/Tools'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block,
    ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal,
    SubDefinition, SubCall, SubReturn, SubBody, Say,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { Pad, IV } from '../src/API'
import { Interpreter, StackFrame } from '../src/Runtime'

/*

sub fact ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * fact( $n - 1 )
    }
}

fact(10);

*/

let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'fact',
            [ 'n' ],
            [
                new Statement(
                    new Conditional(
                        new Equal(
                            new ScalarFetch('n'),
                            new ConstInt(0)
                        ),
                        new Block([
                            new Statement(
                                new SubReturn(
                                    new ConstInt(1)
                                )
                            ),
                        ]),
                        new Block([
                            new Statement(
                                new SubReturn(
                                    new Multiply(
                                        new ScalarFetch('n'),
                                        new SubCall(
                                            new GlobFetch('fact', GlobSlot.CODE),
                                            [
                                                new Subtract(
                                                    new ScalarFetch('n'),
                                                    new ConstInt(1)
                                                )
                                            ]
                                        )
                                    )
                                )
                            ),
                        ])
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
            new SubCall(
                new GlobFetch('fact', GlobSlot.CODE),
                [ new ConstInt(10) ]
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

    assert.strictEqual(strings[0]?.value, "3628800");
});



