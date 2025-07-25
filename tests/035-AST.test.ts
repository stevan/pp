import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
import {
    Program, Statement,
    ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobDeclare, GlobFetch,
    Conditional, Equal, Say, ConstStr, Join,
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { IV, GlobSlot } from '../src/Runtime/API'
import { Pad, StackFrame } from '../src/Runtime'
import { Interpreter } from '../src/Interpreter'

/*

# NOTE: this is tweaked to be the tree I want, and avoid the
# perl peephole optimizer.

my $x = 1;
say join ', ' => 1, (1 + $x), ($x + (1 + $x));

*/

let RUN = new Program([
    new Statement(
        new Say([
            new Join([
                new ConstStr(", "),
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

let interpreter = new Interpreter({ DEBUG : false });

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();

test("... simple AST test", (t) => {
    let strings = interpreter.main.STD_buffer;

    assert.strictEqual(strings[0]?.value, "1, 2, 3");
});
