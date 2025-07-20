
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal, Say, ConstStr, Join,
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

# NOTE: this is tweaked to be the tree I want, and avoid the
# perl peephole optimizer. I altered the B::Concise tree
# output to reflect this.

my $x = 1;
say join ', ' => 1, (1 + $x), ($x + (1 + $x));

perl -MO=Concise -E 'my $x = 1; say join ", " => 1, (1 + $x), ($x + (1 + $x))'
k  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->5
5     <;> nextstate(main 9 -e:1) v:%,us,{,fea=15 ->6
j     <@> say vK ->k
6        <0> pushmark s ->7
i        <@> join[t18] sK/2 ->j
7           <0> pushmark s ->8
8           <$> const(PV ", ") s ->9
9           <$> const(IV 1) s ->a
c           <2> add[t15] sKP/2 ->d
a              <$> const(IV 1) s ->b
b              <0> const(IV 1) s ->c
h           <2> add[t17] sKP/2 ->i
d              <0> const(IV 1) s ->e
g              <2> add[t16] sKP/2 ->h
e                 <$> const(IV 1) s ->f
f                 <0> const(IV 1) s ->g
-e syntax OK

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

let interpreter = new Interpreter();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();
