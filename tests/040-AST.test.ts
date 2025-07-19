
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block,
    ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Eq,
    SubDefinition, SubCall, SubReturn, SubBody,
} from '../src/AST'

import { DECLARE } from '../src/Runtime'

import { Interpreter } from '../src/Interpreter'

/*

// -----------------------------------------------------------------------------
// Initial Perl Code
// -----------------------------------------------------------------------------

sub fact ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * fact( $n - 1 )
    }
}

fact(10);

// -----------------------------------------------------------------------------
// Concise output
// -----------------------------------------------------------------------------

perl -MO=Concise,fact,-main -E 'sub fact ($n) { if ($n == 0) { return 1 } else { return $n*fact($n-1) }} fact(10)'

main::fact:
d  <1> leavesub[1 ref] K/REFC,1 ->(end)
-     <@> lineseq KP ->d
-        <1> ex-argcheck vK/1 ->5
-           <@> lineseq vK ->-
1              <;> nextstate(main 10 -e:1) v:%,us,fea=15 ->2
2              <+> argcheck(1,0) v ->3
3              <;> nextstate(main 9 -e:1) v:%,us,fea=15 ->4
4              <+> argelem(0)[$n:9,16] v/SV ->5
5        <;> nextstate(main 10 -e:1) v:%,us,fea=15 ->6
9           <|> cond_expr(other->a) K/1 ->e
8              <2> eq sK/2 ->9
6                 <0> padsv[$n:9,16] s ->7
7                 <$> const(IV 0) s ->8
-              <@> scope K ->-
-                 <;> ex-nextstate(main 12 -e:1) v:%,us,fea=15 ->a
c                 <@> return K* ->d
a                    <0> pushmark s ->b
b                    <$> const(IV 1) s ->c
q              <@> leave KP ->d
e                 <0> enter ->f
f                 <;> nextstate(main 14 -e:1) v:%,us,fea=15 ->g
p                 <@> return K* ->q
g                    <0> pushmark s ->h
o                    <2> multiply[t4] sK/2 ->p
h                       <0> padsv[$n:9,16] s ->i
n                       <1> entersub[t3] sKS/TARG ->o
-                          <1> ex-list sK ->n
i                             <0> pushmark s ->j
l                             <2> subtract[t2] sKM/2 ->m
j                                <0> padsv[$n:9,16] s ->k
k                                <$> const(IV 1) s ->l
-                             <1> ex-rv2cv sK/1 ->-
m                                <$> gv(*fact) s/EARLYCV ->n
main program:
x  <@> leave[1 ref] vKP/REFC ->(end)
r     <0> enter v ->s
s     <;> nextstate(main 17 -e:1) v:%,us,{,fea=15 ->t
w     <1> entersub vKS ->x
-        <1> ex-list K ->w
t           <0> pushmark s ->u
u           <$> const(IV 10) sM ->v
-           <1> ex-rv2cv sK/1 ->-
v              <$> gv(*fact) s ->w
-e syntax OK

sub fact ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * fact( $n - 1 )
    }
}

*/

let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'fact',
            [ new ScalarVar('n') ],
            [
                new Statement(
                    new Conditional(
                        new Eq(
                            new ScalarFetch('n'),
                            new ConstInt(0)
                        ),
                        new Block([
                            new Statement(
                                new SubReturn(new ConstInt(1))
                            ),
                        ]),
                        new Block([
                            new Statement(
                                new SubReturn(
                                    new Multiply(
                                        new ScalarFetch('n'),
                                        new SubCall(
                                            new GlobFetch('fact', GlobSlot.CODE),
                                            [
                                                new Subtract(
                                                    new ScalarFetch('n'),
                                                    new ConstInt(1)
                                                )
                                            ]
                                        )
                                    )
                                )
                            ),
                        ])
                    )
                )
            ]
        )
    )
]);

let RUN = new Program([
    new Statement(
        new SubCall(
            new GlobFetch('fact', GlobSlot.CODE),
            [ new ConstInt(6) ]
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

let comptime = BEGIN.emit();
let runtime  = RUN.emit();

//logger.log(op);

logger.group('DEPARSE/BEGIN:');
logger.log(BEGIN.deparse());
logger.groupEnd();

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('BEGIN/EXEC:');
dump(comptime.enter);
logger.groupEnd();

logger.group('RUN/EXEC:');
dump(runtime.enter);
logger.groupEnd();

logger.group('BEGIN/WALK:');
walk(comptime.leave);
logger.groupEnd();

logger.group('RUN/WALK:');
walk(runtime.leave);
logger.groupEnd();

let interpreter = new Interpreter();

logger.group('INTERPRET/BEGIN:');
interpreter.run(comptime);
logger.groupEnd();

logger.group('INTERPRET/RUN:');
interpreter.run(runtime);
logger.groupEnd();

