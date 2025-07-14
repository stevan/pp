
import { logger } from '../src/Logger'
import {
    OP, UNOP, BINOP, COP, OpTree
} from '../src/OpTree'

import { Interpreter } from '../src/Runtime'

/*
// my $x = 1;
// my $y = 1;
// $x + $y;
*/

let one = new OP('const', { literal : 1 });
let two = new OP('const', { literal : 2 });

let decl_x = new UNOP('padsv_store', { target : 'x' });
let decl_y = new UNOP('padsv_store', { target : 'y' });

let add = new BINOP('add', { operation : '+' });

let get_x = new UNOP('padsv_fetch', { target : 'x' });
let get_y = new UNOP('padsv_fetch', { target : 'y' });

let enter = new OP('enter', {});
let stmt1 = new COP();
let stmt2 = new COP();
let stmt3 = new COP();
let leave = new UNOP('leave', { halt : true });

// Execution order

enter.next  = stmt1;

stmt1.next  = one;
one.next    = decl_x;
decl_x.next = stmt2;

stmt2.next  = two;
two.next    = decl_y;
decl_y.next = stmt3;

stmt3.next  = get_x;
get_x.next  = get_y;
get_y.next  = add;
add.next    = leave;

// run it ...

let interpreter = new Interpreter();

interpreter.run(new OpTree(enter, leave));
