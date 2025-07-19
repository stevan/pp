
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block, Modulo,
    ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal,
    SubDefinition, SubCall, SubReturn, SubBody, Say,
} from '../src/AST'

import { DECLARE } from '../src/Runtime'

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
            'gcd',
            [ new ScalarVar('a'), new ScalarVar('b') ],
            [
                new Statement(
                    new Conditional(
                        new Equal(
                            new ScalarFetch('b'),
                            new ConstInt(0)
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
                                            new Modulo(
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
            ]
        )
    )
]);

let RUN = new Program([
    new Statement(
        new ScalarDeclare(
            new ScalarVar('x'),
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

