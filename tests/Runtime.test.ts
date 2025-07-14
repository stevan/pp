
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarDecl, ScalarVar,
    ConstInt,
    Add,
} from '../src/Parser'

import { Interpreter } from '../src/Runtime'

/*

sub factorial ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * factorial( $n - 1 )
    }
}

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

