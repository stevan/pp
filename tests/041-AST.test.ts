import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block, Modulus,
    ConstUndef, GlobVar, GlobDeclare, GlobFetch,
    Conditional, Equal,
    SubDefinition, SubCall, SubReturn, SubBody, Say,
    ParenExpression, ListExpression, Bareword
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { IV, GlobSlot } from '../src/Runtime/API'
import { Pad, StackFrame } from '../src/Runtime'
import { Interpreter } from '../src/Interpreter'

/*

sub gcd ($a, $b) {
    if ($b == 0) {
        return $a
    } else {
        return gcd($b, $a % $b)
    }
}

*/

let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            new Bareword('gcd'),
            new ListExpression([ new ScalarFetch('a'), new ScalarFetch('b') ]),
            new Block([
                new Statement(
                    new Conditional(
                        new ParenExpression(
                            new Equal(
                                new ScalarFetch('b'),
                                new ConstInt(0)
                            )
                        ),
                        new Block([
                            new Statement(
                                new SubReturn(
                                    new ScalarFetch('a')
                                )
                            ),
                        ]),
                        new Block([
                            new Statement(
                                new SubReturn(
                                    new SubCall(
                                        new GlobFetch('gcd', GlobSlot.CODE),
                                        [
                                            new ScalarFetch('b'),
                                            new Modulus(
                                                new ScalarFetch('a'),
                                                new ScalarFetch('b'),
                                            )
                                        ]
                                    )
                                )
                            ),
                        ])
                    )
                )
            ])
        )
    )
]);

let RUN = new Program([
    new Statement(
        new ScalarDeclare(
            'x',
            new SubCall(
                new GlobFetch('gcd', GlobSlot.CODE),
                // Factorial(25), Factorial(24) .. recurses 24 times
                [ new ConstInt(75025), new ConstInt(46368) ]
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

    assert.strictEqual(strings[0]?.value, "1");
});


