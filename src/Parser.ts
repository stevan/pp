
import {
    OP,
    NOOP,
    COP,
    UNOP,
    BINOP,
    OpTree
} from './OpTree'

export interface Node {
    deparse () : string;
    emit    () : OpTree;
}

export class Program implements Node {
    constructor(public statements : Statement[]) { }

    deparse() : string {
        return this.statements.map((s) => s.deparse()).join('\n');
    }

    emit () : OpTree {
        let enter = new OP('enter', {});
        let leave = new UNOP('leave', { halt : true });

        leave.first = enter;

        let curr = enter;
        for (const statement of this.statements) {
            let s = statement.emit();

            curr.next    = s.enter;
            curr.sibling = s.leave;
            curr         = s.leave;
        }

        curr.next = leave;

        return new OpTree(enter, leave);
    }
}

export class Statement implements Node {
    constructor(public body : Node) {}

    deparse() : string { return this.body.deparse() + ';' }

    emit () : OpTree {
        let s = new COP();
        let n = this.body.emit();
        s.next = n.enter;
        return new OpTree(s, n.leave);
    }
}

export class ConstInt implements Node {
    constructor(public literal : number) {}

    deparse() : string { return String(this.literal) }

    emit () : OpTree {
        let op = new OP('const', { literal : this.literal })
        return new OpTree(op, op)
    }
}

export class ScalarVar implements Node {
    constructor(public name : string) {}

    deparse() : string { return '$' + this.name }

    emit () : OpTree {
        let op =  new UNOP('padsv_fetch', {
            target : this.name
        });
        return new OpTree(op, op)
    }
}

export class ScalarDecl implements Node {
    constructor(
        public ident : ScalarVar,
        public value : Node,
    ) {}

    deparse() : string {
        return `my ${this.ident.deparse()} = ${this.value.deparse()}`
    }

    emit () : OpTree {
        let value = this.value.emit();

        let variable = new UNOP('padsv_store', {
            target : this.ident.name
        });

        value.enter.next = variable;
        variable.first   = value.enter;
        return new OpTree(value.enter, variable);
    }
}

export class Add implements Node {
    constructor(
        public lhs : Node,
        public rhs : Node,
    ) {}

    deparse() : string {
        return `${this.lhs.deparse()} + ${this.rhs.deparse()}`
    }

    emit () : OpTree {
        let lhs = this.lhs.emit();
        let rhs = this.rhs.emit();
        let op  = new BINOP('add', { operation : '+' });

        lhs.enter.next = rhs.enter;
        rhs.enter.next = op;
        op.first = lhs.enter;
        op.last  = rhs.enter;
        lhs.enter.sibling = rhs.enter;
        return new OpTree(lhs.enter, op);
    }
}
