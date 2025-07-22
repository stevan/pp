import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter } from '../src/Tools'

import {
    Program,
    Statement,
    ConstInt, ConstStr,
    ArrayDeclare,
    ArrayFetch,
    ArrayElemFetch,
    Subtract,
    Say, Join,
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { Pad, IV, AV } from '../src/API'
import { Interpreter, StackFrame } from '../src/Runtime'

/*

my @foo = (1, 2, 3);
say @foo[0];
say @foo[ @foo[0] ;
say @foo[ @foo[2] - 1 ];

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
    new Statement(new Say([
        new ConstStr('second : '),
        new ArrayElemFetch('foo', new ArrayElemFetch('foo', new ConstInt(0)))
    ])),
    new Statement(new Say([
        new ConstStr('third  : '),
        new ArrayElemFetch('foo',
            new Subtract(
                new ArrayElemFetch('foo', new ConstInt(2)),
                new ConstInt(1)
            )
        )
    ])),
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

    assert.strictEqual(strings[0]?.value, "first  : ");
    assert.strictEqual(strings[1]?.value, "1");
    assert.strictEqual(strings[2]?.value, "second : ");
    assert.strictEqual(strings[3]?.value, "2");
    assert.strictEqual(strings[4]?.value, "third  : ");
    assert.strictEqual(strings[5]?.value, "3");

    let frame = interpreter.main.frames[0] as StackFrame;
    let pad   = frame.padlist.at(-1)  as Pad;

    assert.ok(pad.has('foo'));

    let foo = pad.get('foo') as AV;

    assert.strictEqual((foo.contents[0] as IV).value, 1);
    assert.strictEqual((foo.contents[1] as IV).value, 2);
    assert.strictEqual((foo.contents[2] as IV).value, 3);
});
