
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarStore, ScalarFetch,
    ConstInt,
    Add,
} from '../src/Parser'

import { Interpreter } from '../src/Runtime'

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

// -----------------------------------------------------------------------------
// Simplify the opcode tree
// -----------------------------------------------------------------------------

main:
leave
    enter
        entersub
            pushmark
                const
            gv_fetch

fact:
leavesub
    lineseq
        nextstate
        argcheck
            nextstate
            argelem
        nextstate
        cond_expr
            eq
                padsv_fetch
                const
            leavescope
                enterscope
                    nextstate
                    return
                        pushmark
                            const
            leavescope
                enterscope
                    nextstate
                    return
                        pushmark
                        multiply
                            padsv_fetch
                            entersub
                                pushmark
                                subtract
                                    padsv_fetch
                                    const
                                gv_fetch

// -----------------------------------------------------------------------------
// Catalog the ones to build
// -----------------------------------------------------------------------------

// ---------------------
// very easy
// ---------------------

- gv_fetch
    - locates the GV to be called by entersub

// ---------------------
// kinda easy
// ---------------------

- lineseq
    - runs multipe statements together
- pushmark
    - declares the start of arguments for entersub
- cond_expr
    - first is a conditional expression
    - then the if-true part
    - then the if-false part

// ---------------------
// Ponder
// ---------------------

- entersub
    - sets up any stack frames, etc.
    - enters a new scope
- leavesub
    - leaves the scope
    - places return values where expected

- return
    - expects a pushmark followed by an expression
    - we need to connect the end of the expression to the leavesub
        - this will require a second phase perhaps
        - or having the enter/leave in scope somehow

// ---------------------
// Remove
// ---------------------

// these should be part of entersub

- argcheck
    - checks arg arity
    - could be handled in entersub
    - could also be compile time checked
- argelem
    - moves arg from stack to local
    - could also be handled in entersub


*/

let prog = new Program([]);

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

