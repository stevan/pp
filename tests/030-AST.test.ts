
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarDeclare, ScalarStore, ScalarFetch,
    ConstInt,
    Add,
} from '../src/AST'

import { Interpreter } from '../src/Interpreter'

/*
// my $x = 1;
// my $y = 2;
// my $z = $x + $x + $y + $x + $y + $x + $y + $x + $y;
*/

let prog = new Program([
    new Statement(
        new ScalarDeclare(new ScalarVar('x'), new ConstInt(1))),
    new Statement(
        new ScalarDeclare(new ScalarVar('y'), new ConstInt(2))),
    new Statement(
        new ScalarDeclare(new ScalarVar('z'),
            new Add(
                new Add(
                    new ScalarFetch('x'),
                    new Add(
                        new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                        new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                    )
                ),
                new Add(
                    new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                    new Add(new ScalarFetch('x'), new ScalarFetch('y')),
                )
            )
        )
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

