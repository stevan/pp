
import { logger } from '../src/Logger'
import {
    OP, UNOP, BINOP, COP
} from '../src/Runtime'



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
/*

perl -MO=Concise,-exec -E 'my $x = 1; my $y = 2; $x + $y'

*/

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

// Tree order
/*

perl -MO=Concise -E 'my $x = 1; my $y = 2; $x + $y'

*/

leave.first   = enter;
    enter.sibling = stmt1;

    stmt1.sibling = decl_x;
        decl_x.sibling = stmt2;
        decl_x.first   = one;

    stmt2.sibling = decl_y;
        decl_y.sibling = stmt3;
        decl_y.first   = two;

        stmt3.sibling = add;
            add.first = get_x;
            add.last  = get_y;
                get_x.sibling = get_y;


function walk(op : any, depth : number = 0) {
    logger.log("  ".repeat(depth), op.name, op.config);
    for (let k : any = op.first; k != undefined; k = k.sibling) {
        walk(k, depth + 1);
    }
}

function run(op : any) {
    while (op != undefined) {
        logger.log(op.name, op.config);
        op = op.next;
    }
}

logger.group('Exec Order');
run(enter);
logger.groupEnd();
logger.group('Tree Order');
walk(leave);
logger.groupEnd();

