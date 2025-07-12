
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarDecl, ScalarVar,
    ConstInt,
    Add,
} from '../src/Parser'

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
