import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'

import {
    Program,
    Statement,
    ConstInt, ConstStr,
    ArrayLiteral,
    ArrayDeclare,
    ArrayFetch, ScalarFetch,
    ArrayElemFetch,
    ArrayElemStore,
    Say, Join, Subtract,
    ForEachLoop,
    Block,
} from '../src/Parser/AST'

import { Compiler } from '../src/Compiler'

import { IV, AV } from '../src/Runtime/API'
import { Pad, StackFrame } from '../src/Runtime'
import { Interpreter } from '../src/Interpreter'

/*

my @foo = (1, 2, 3);

foreach my $foo (@foo) {
    say $foo;
}

perl -MO=Concise -E 'my @foo = (1, 2, 3); foreach my $foo (@foo) { say $foo; my $x = 10 }'

m  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->2
2     <;> nextstate(main 8 -e:1) v:%,us,{,fea=15 ->3
9     <2> aassign[t15] vKS ->a
-        <1> ex-list lKP ->7
3           <0> pushmark s ->4
4           <$> const(IV 1) s ->5
5           <$> const(IV 2) s ->6
6           <$> const(IV 3) s ->7
-        <1> ex-list lK ->9
7           <0> pushmark s ->8
8           <0> padav[@foo:8,14] lRM*\/LVINTRO ->9
a     <;> nextstate(main 9 -e:1) v:%,us,{,fea=15 ->b
l     <2> leaveloop vK/2 ->m
d        <{> enteriter(next->i last->l redo->e)[$foo:10,13] vKS/LVINTRO ->j
-           <0> ex-pushmark s ->b
-           <1> ex-list lKM ->d
b              <0> pushmark sM ->c
c              <0> padav[@foo:8,14] sRM ->d
-        <1> null vK/1 ->l
k           <|> and(other->e) vK/1 ->l
j              <0> iter s ->k
-              <@> lineseq vK ->-
e                 <;> nextstate(main 12 -e:1) v:%,us,fea=15 ->f
h                 <@> say vK ->i
f                    <0> pushmark s ->g
g                    <0> padsv[$foo:10,13] s ->h
i                 <0> unstack v ->j
-e syntax OK

*/

let RUN = new Program([
    new Statement(
        new ArrayDeclare('foo', new ArrayLiteral([
            new ConstInt(1),
            new ConstInt(2),
            new ConstInt(3),
        ])),
    ),
    new Statement(
        new ForEachLoop(
            'foo', new ArrayFetch('foo'), new Block([
                new Statement(
                    new Say([
                        new ScalarFetch('foo')
                    ])
                )
            ])
        )
    )
]);

//let compiler = new Compiler();

//logger.log('... compiling RUN');
//let runtime  = compiler.compile(RUN);

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

//logger.group('RUN/EXEC:');
//walkExecOrder(prettyPrinter, runtime.enter);
//logger.groupEnd();
//
//logger.group('RUN/WALK:');
//walkTraversalOrder(prettyPrinter, runtime.leave);
//logger.groupEnd();
//
//let interpreter = new Interpreter({ DEBUG : false });
//
//logger.group('RUN/INTERPRET:');
//logger.time('RUN elapased');
//interpreter.run(runtime);
//logger.timeEnd('RUN elapased');
//logger.groupEnd();
//
//test("... simple AST test", (t) => {
//    let strings = interpreter.main.STD_buffer;
//    let frame   = interpreter.frames[0] as StackFrame;
//    let pad     = frame.padlist.at(-1)  as Pad;
//
//    //assert.strictEqual(strings[0]?.value, "3, 1, 2");
//
//    assert.ok(pad.has('foo'));
//
//    let foo = pad.get('foo') as AV;
//    assert.strictEqual((foo.contents[0] as IV).value, 1);
//    assert.strictEqual((foo.contents[1] as IV).value, 2);
//    assert.strictEqual((foo.contents[2] as IV).value, 3);
//});
