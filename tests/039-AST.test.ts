
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

import { DECLARE } from '../src/Runtime'

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


function dump(op : any, depth : number = 0) {
    //logger.log(op);
    while (op != undefined) {
        logger.log("  ".repeat(depth), op.name, op.config);

        if (op.name == 'goto' && depth > 0) {
            return;
        }

        if (op.other) {
            dump(op.other, depth + 1);
        }

        op = op.next;
    }
}

function walk(op : any, depth : number = 0) {
    logger.log("  ".repeat(depth), op.name, op.config);
    for (let k : any = op.first; k != undefined; k = k.sibling) {
        walk(k, depth + 1);
    }
}

let comptime = BEGIN.emit();
let runtime  = RUN.emit();

//logger.log(op);

logger.group('DEPARSE/BEGIN:');
logger.log(BEGIN.deparse());
logger.groupEnd();

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('BEGIN/EXEC:');
dump(comptime.enter);
logger.groupEnd();

logger.group('RUN/EXEC:');
dump(runtime.enter);
logger.groupEnd();

logger.group('BEGIN/WALK:');
walk(comptime.leave);
logger.groupEnd();

logger.group('RUN/WALK:');
walk(runtime.leave);
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

