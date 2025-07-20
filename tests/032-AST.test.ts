
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch
} from '../src/AST'

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { OP, DECLARE } from '../src/Runtime'

import { Interpreter } from '../src/Interpreter'

/*

our $foo = 10;
my $bar = $foo;

perl -MO=Concise -E 'our $foo = 10;my $bar = $foo'

9  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->2
2     <;> nextstate(main 8 -e:1) v:%,us,{,fea=15 ->3
5     <2> sassign vKS/2 ->6
3        <$> const(IV 10) s ->4
-        <1> ex-rv2sv sKRM*\/OURINTR,1 ->5
4           <$> gvsv(*foo) s\/OURINTR ->5
6     <;> nextstate(main 9 -e:1) v:%,us,{,fea=15 ->7
8     <1> padsv_store[$bar:9,10] vKS\/LVINTRO ->9
-        <1> ex-rv2sv sK/1 ->8
7           <$> gvsv(*foo) s ->8
-        <0> ex-padsv sRM*\/LVINTRO ->8

*/

let RUN = new Program([
    new Statement(
        new GlobDeclare(
            new GlobVar('foo', GlobSlot.SCALAR),
            new ConstInt(10)
        )
    ),
    new Statement(
        new ScalarDeclare(
            new ScalarVar('bar'),
            new GlobFetch('foo', GlobSlot.SCALAR)
        )
    ),
]);

const prettyPrint = (op : OP, depth : number) : void => logger.log("  ".repeat(depth), op.name, op.config)

let compiler = new Compiler();

logger.log('... compiling RUN');
let runtime  = compiler.compile(RUN);

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('RUN/EXEC:');
walkExecOrder(prettyPrint, runtime.enter);
logger.groupEnd();

logger.group('RUN/WALK:');
walkTraversalOrder(prettyPrint, runtime.leave);
logger.groupEnd();

let interpreter = new Interpreter();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();
