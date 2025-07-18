
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Eq,
} from '../src/AST'
import { Interpreter } from '../src/Interpreter'

/*

my $foo = 0;
if ($foo == 0) {
    $foo = 20;
} else {
    $foo = 10;
}

perl -MO=Concise -E 'my $foo = 0; if ($foo == 0) { $foo = 20; } else { $foo = 10; }'

c  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->2
2     <;> nextstate(main 8 -e:1) v:%,us,{,fea=15 ->3
4     <1> padsv_store[$foo:8,15] vKS/LVINTRO ->5
3        <$> const(IV 0) s ->4
-        <0> ex-padsv sRM*\/LVINTRO ->4
5     <;> nextstate(main 9 -e:1) v:%,us,{,fea=15 ->6
-     <1> null vK/1 ->c
9        <|> cond_expr(other->a) vK/1 ->d
8           <2> eq sK/2 ->9
6              <0> padsv[$foo:8,15] s ->7
7              <$> const(IV 0) s ->8
-           <@> scope vK ->-
-              <;> ex-nextstate(main 11 -e:1) v:%,us,fea=15 ->a
b              <1> padsv_store[$foo:8,15] vKS ->c
a                 <$> const(IV 20) s ->b
-                 <0> ex-padsv sRM* ->b
h           <@> leave vKP ->c
d              <0> enter v ->e
e              <;> nextstate(main 13 -e:1) v:%,us,fea=15 ->f
g              <1> padsv_store[$foo:8,15] vKS ->h
f                 <$> const(IV 10) s ->g
-                 <0> ex-padsv sRM* ->g
-e syntax OK

*/

let prog = new Program([
    new Statement(
        new ScalarDeclare(new ScalarVar('foo'), new ConstInt(0))
    ),
    new Statement(
        new Conditional(
            new Eq(
                new ScalarFetch('foo'),
                new ConstInt(0)
            ),
            new Block([
                new Statement(
                    new ScalarStore(new ScalarVar('foo'), new ConstInt(20))
                ),
            ]),
            new Block([
                new Statement(
                    new ScalarStore(new ScalarVar('foo'), new ConstInt(10))
                ),
            ])
        )
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

