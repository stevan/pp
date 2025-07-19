
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal, Say,
} from '../src/AST'
import { Interpreter } from '../src/Interpreter'

/*

# NOTE: this is tweaked to be the tree I want, and avoid the
# perl peephole optimizer. I altered the B::Concise tree
# output to reflect this.

my $x = 1;
say 1, (1 + $x), ($x + (1 + $x));

perl -MO=Concise -E 'my $x = 1; say 1, (1 + $x), ($x + (1 + $x))'
h  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->5
5     <;> nextstate(main 9 -e:1) v:%,us,{,fea=15 ->6
g     <@> say vK ->h
6        <0> pushmark s ->7
7        <$> const(IV 1) s ->8
a        <2> add[t15] sKP/2 ->b
8           <$> const(IV 1) s ->9
9           <0> const(IV 1) s ->a
f        <2> add[t17] sKP/2 ->g
b           <0> const(IV 1) s ->c
e           <2> add[t16] sKP/2 ->f
c              <$> const(IV 1) s ->d
d              <0> const(IV 1) s ->e
-e syntax OK

*/

let prog = new Program([
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

function dump(op : any, depth : number = 0) {
    //logger.log(op);
    while (op != undefined) {
        logger.log("  ".repeat(depth), op.name, op.config);

        if (op.name == 'goto' && depth > 0) {
            return;
        }

        if (op.other) {
            dump(op.other, depth + 1);
        }

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

