
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, Undef,
} from '../src/AST'

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

let prog = new Program([
    new Statement(
        new ScalarDeclare(new ScalarVar('x'), new ConstInt(1))),
    new Statement(
        new ScalarDeclare(new ScalarVar('y'), new Undef())),
    new Statement(
        new Block([
            new Statement(
                new ScalarDeclare(new ScalarVar('x'), new ConstInt(10))),
            new Statement(
                new ScalarStore(new ScalarVar('y'), new ScalarFetch('x'))),
        ])
    )
]);

function dump(op : any) {
    //logger.log(op);
    while (op != undefined) {
        logger.log(op.name, op.config);
        op = op.next;
    }
}

function walk(op : any, depth : number = 0) {
    logger.log("  ".repeat(depth), op.name, op.config);
    for (let k : any = op.first; k != undefined; k = k.sibling) {
        walk(k, depth + 1);
    }
}

let op = prog.emit();

//logger.log(op);

logger.group('DEPARSE:');
logger.log(prog.deparse());
logger.groupEnd();

logger.group('EXEC:');
dump(op.enter);
logger.groupEnd();

logger.group('WALK:');
walk(op.leave);
logger.groupEnd();


logger.group('RUN:');
let interpreter = new Interpreter();
interpreter.run(op);
logger.groupEnd();

