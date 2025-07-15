
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, Undef, GlobVar
} from '../src/Parser'

import { GlobSlot }    from '../src/SymbolTable'
import { Interpreter } from '../src/Runtime'

/*

our $foo = 10;

perl -MO=Concise -E 'our $foo = 10;'

6  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->2
2     <;> nextstate(main 8 -e:1) v:%,us,{,fea=15 ->3
5     <2> sassign vKS/2 ->6
3        <$> const(IV 10) s ->4
-        <1> ex-rv2sv sKRM*\/OURINTR,1 ->5
4           <$> gvsv(*foo) s\/OURINTR ->5


*/

let prog = new Program([
    new Statement(
        new GlobVar('foo', GlobSlot.SCALAR)
    ),
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

