
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef,
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
my $y;
{
   my $x = 10;
   $y = $x;
}

perl -MO=Concise -E 'my $x = 1; my $y; { my $x = 10; $y = $x; }'

g  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->2
2     <;> nextstate(main 8 -e:1) v:%,us,{,fea=15 ->3
4     <1> padsv_store[$x:8,13] vKS/LVINTRO ->5
3        <$> const(IV 1) s ->4
-        <0> ex-padsv sRM*\/LVINTRO ->4
5     <;> nextstate(main 9 -e:1) v:%,us,{,fea=15 ->6
6     <0> padsv[$y:9,13] vM/LVINTRO ->7
7     <;> nextstate(main 10 -e:1) v:%,us,{,fea=15 ->8
f     <2> leaveloop vK/2 ->g
8        <{> enterloop(next->f last->f redo->9) v ->9
-        <@> lineseq vKP ->f
9           <;> nextstate(main 11 -e:1) v:%,us,fea=15 ->a
b           <1> padsv_store[$x:11,12] vKS/LVINTRO ->c
a              <$> const(IV 10) s ->b
-              <0> ex-padsv sRM*\/LVINTRO ->b
c           <;> nextstate(main 12 -e:1) v:%,us,fea=15 ->d
e           <1> padsv_store[$y:9,13] vKS ->f
d              <0> padsv[$x:11,12] s ->e
-              <0> ex-padsv sRM* ->e
-e syntax OK

*/

let RUN = new Program([
    new Statement(
        new ScalarDeclare(new ScalarVar('x'), new ConstInt(1))),
    new Statement(
        new ScalarDeclare(new ScalarVar('y'), new ConstUndef())),
    new Statement(
        new Block([
            new Statement(
                new ScalarDeclare(new ScalarVar('x'), new ConstInt(10))),
            new Statement(
                new ScalarStore(new ScalarVar('y'), new ScalarFetch('x'))),
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
