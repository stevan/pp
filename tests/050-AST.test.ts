
import { logger, prettyPrinter } from '../src/Logger'

import {
    Program,
    Statement,
    ConstInt, ConstStr,
    ArrayDeclare,
    ArrayFetch,
    Say, Join,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { Interpreter } from '../src/Interpreter'

/*

my @foo = (1, 2, 3);
say join ', ' => @foo;

*/

let RUN = new Program([
    new Statement(
        new ArrayDeclare('foo', [
            new ConstInt(1),
            new ConstInt(2),
            new ConstInt(3),
        ]),
    ),
    new Statement(
        new Say([
            new Join([
                new ConstStr(', '),
                new ArrayFetch('foo')
            ])
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
interpreter.run(runtime, { DEBUG : true });
logger.timeEnd('RUN elapased');
logger.groupEnd();
