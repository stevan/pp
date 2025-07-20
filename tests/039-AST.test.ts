
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block,
    ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal, LessThan,
    SubDefinition, SubCall, SubReturn, SubBody, Say,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
    prettyPrinter,
} from '../src/Compiler'

import { OP, DECLARE } from '../src/Runtime'

import { Interpreter } from '../src/Interpreter'

/*

sub fib ($n) {
    if ($n < 2) {
        return $n;
    } else {
        return fib( $n - 1 )
             + fib( $n - 2 );
    }
}

perl -E 'sub fib ($n) { if ($n < 2) { return $n } else { return fib($n-1)+fib($n-2)}} say fib(2)'

*/

let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'fib',
            [ new ScalarVar('n') ],
            [
                new Statement(
                    new Conditional(
                        new LessThan(
                            new ScalarFetch('n'),
                            new ConstInt(2)
                        ),
                        new Block([
                            new Statement(
                                new SubReturn(new ScalarFetch('n'))
                            ),
                        ]),
                        new Block([
                            new Statement(
                                new SubReturn(
                                    new Add(
                                        new SubCall(
                                            new GlobFetch('fib', GlobSlot.CODE),
                                            [
                                                new Subtract(
                                                    new ScalarFetch('n'),
                                                    new ConstInt(1)
                                                )
                                            ]
                                        ),
                                        new SubCall(
                                            new GlobFetch('fib', GlobSlot.CODE),
                                            [
                                                new Subtract(
                                                    new ScalarFetch('n'),
                                                    new ConstInt(2)
                                                )
                                            ]
                                        ),
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
            new ScalarVar('x'),
            new SubCall(
                new GlobFetch('fib', GlobSlot.CODE),
                [ new ConstInt(25) ]
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
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();
