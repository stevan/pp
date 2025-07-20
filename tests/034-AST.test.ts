
import { logger, prettyPrinter } from '../src/Logger'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal, Say,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { OP, DECLARE } from '../src/Runtime'

import { Interpreter } from '../src/Interpreter'

/*

# NOTE: this is tweaked to be the tree I want, and avoid the
# perl peephole optimizer

my $x = 1;
say 1, (1 + $x), ($x + (1 + $x));

*/

let RUN = new Program([
    new Statement(
        new Say([
            new ConstInt(1),
            new Add(
                new ConstInt(1),
                new ConstInt(1)
            ),
            new Add(
                new ConstInt(1),
                new Add(
                    new ConstInt(1),
                    new ConstInt(1)
                ),
            ),
        ])
    )
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
