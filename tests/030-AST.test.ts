
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarDeclare, ScalarStore, ScalarFetch,
    ConstInt,
    Add,
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
my $x = 1;
my $y = 2;
my $z = $x + $x + $y + $x + $y + $x + $y + $x + $y;
*/

let RUN = new Program([
    new Statement(
        new ScalarDeclare('x', new ConstInt(1))),
    new Statement(
        new ScalarDeclare('y', new ConstInt(2))),
    new Statement(
        new ScalarDeclare('z',
            new Add(
                new Add(
                    new ScalarFetch('x'),
                    new Add(
                        new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                        new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                    )
                ),
                new Add(
                    new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                    new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                )
            )
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

let interpreter = new Interpreter();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();
