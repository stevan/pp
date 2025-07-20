
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch
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

our $foo = 10;
my $bar = $foo;

*/

let RUN = new Program([
    new Statement(
        new GlobDeclare(
            new GlobVar('foo', GlobSlot.SCALAR),
            new ConstInt(10)
        )
    ),
    new Statement(
        new ScalarDeclare(
            'bar',
            new GlobFetch('foo', GlobSlot.SCALAR)
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
