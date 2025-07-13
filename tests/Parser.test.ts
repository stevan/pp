
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarDecl, ScalarVar,
    ConstInt,
    Add,
} from '../src/Parser'

import { Interpreter } from '../src/Runtime'

/*
// my $x = 1;
// my $y = 1;
// $x + $y;
*/

let prog = new Program([
    new Statement(new ScalarDecl(new ScalarVar('x'), new ConstInt(1))),
    new Statement(new ScalarDecl(new ScalarVar('y'), new ConstInt(2))),
    new Statement(new Add(new ScalarVar('x'), new ScalarVar('y'))),
]);

console.log(prog.deparse());

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


dump(op.enter);
walk(op.leave);

let interpreter = new Interpreter();
interpreter.run(op);
