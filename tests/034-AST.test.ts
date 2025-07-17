
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, Undef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Eq, Say,
} from '../src/AST'
import { Interpreter } from '../src/Interpreter'

/*

say 1, 2, 3;

perl -MO=Concise -E 'say 1, 2, 3'
a  <@> leave[1 ref] vKP/REFC ->(end)
1     <0> enter v ->2
2     <;> nextstate(main 8 -e:1) v:%,us,{,fea=15 ->3
9     <@> say vK ->a
3        <0> pushmark s ->4
4        <$> const(IV 1) s ->5
5        <$> const(IV 2) s ->6
6        <$> const(IV 3) s ->7
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

