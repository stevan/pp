
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Block, Undef,
} from '../src/Parser'

import { Interpreter } from '../src/Runtime'

/*

my $x = 1;
my $y;
{
   my $x = 10;
   $y = $x;
}

perl -MO=Concise -E 'my $x = 1; my $y; { my $x = 10; $y = $x; }'

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

