// -----------------------------------------------------------------------------

type MaybeOP = OP | undefined

class OP {
    public name    : string;
    public config  : any;
    public next    : MaybeOP; // exeuction order
    public sibling : MaybeOP; // tree order

    constructor (name : string, config : any) {
        this.name   = name;
        this.config = config;
    }
}

// statement seperators
class COP extends OP {
    constructor() {
        super('nextstate', {})
    }
}

// unary operations
class UNOP extends OP {
    public first : MaybeOP;
}

// binary operations
class BINOP extends UNOP {
    public last : MaybeOP;
}

// logical operations (short circuit)
class LOGOP extends UNOP {
    public other : MaybeOP;
}

// operations that take lists
class LISTOP extends BINOP {
    public children : number = 0;
}

// -----------------------------------------------------------------------------

class Pad {
    // TODO - figure out entries here ...
}

class Optree {
    constructor(
        public root  : OP,
        public start : OP,
        public pad   : Pad,
    ) {}
}

// -----------------------------------------------------------------------------

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
    console.log("  ".repeat(depth), op.name, op.config);
    for (let k : any = op.first; k != undefined; k = k.sibling) {
        walk(k, depth + 1);
    }
}

function run(op : any) {
    while (op != undefined) {
        console.log(op.name, op.config);
        op = op.next;
    }
}

console.group('Exec Order');
run(enter);
console.groupEnd();
console.group('Tree Order');
walk(leave);
console.groupEnd();


