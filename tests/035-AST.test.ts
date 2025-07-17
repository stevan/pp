
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Eq, Say, ConstStr, Join,
} from '../src/AST'
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

let prog = new Program([
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

