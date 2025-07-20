
import { logger, prettyPrinter } from '../src/Logger'

import {
    Program,
    Statement,
    ConstInt, ConstStr,
    ArrayDeclare,
    ArrayFetch,
    ArrayElemFetch,
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
say @foo[0];
say @foo[1];
say @foo[2];

*/

let RUN = new Program([
    new Statement(
        new ArrayDeclare('foo', [
            new ConstInt(1),
            new ConstInt(2),
            new ConstInt(3),
        ]),
    ),
    new Statement(new Say([ new ConstStr('first  : '), new ArrayElemFetch('foo', new ConstInt(0)) ])),
    new Statement(new Say([ new ConstStr('second : '), new ArrayElemFetch('foo', new ConstInt(1)) ])),
    new Statement(new Say([ new ConstStr('third  : '), new ArrayElemFetch('foo', new ConstInt(2)) ])),
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
interpreter.run(runtime, { DEBUG : false });
logger.timeEnd('RUN elapased');
logger.groupEnd();
