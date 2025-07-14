
import {
    OP, NOOP, COP, UNOP, BINOP, OpTree
} from './OpTree'

// -----------------------------------------------------------------------------
// AST Node
// -----------------------------------------------------------------------------

export interface Node {
    deparse () : string;
    emit    () : OpTree;
}

// -----------------------------------------------------------------------------
// Compilation Unit
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Statements
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export class ConstInt implements Node {
    constructor(public literal : number) {}

    deparse() : string { return String(this.literal) }

    emit () : OpTree {
        let op = new OP('const', { literal : this.literal })
        return new OpTree(op, op)
    }
}

// -----------------------------------------------------------------------------
// Unary Ops
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Binary Ops
// -----------------------------------------------------------------------------

export class ScalarDecl implements Node {
    constructor(
        public ident : ScalarVar,
        public value : Node,
    ) {}

    deparse() : string {
        return `my ${this.ident.deparse()} = ${this.value.deparse()}`
    }

    emit () : OpTree {
        let value    = this.value.emit();
        let variable = this.ident.emit();
        let binding  = new BINOP('padsv_store', {
            operation : '=',
            target    : this.ident.name,
        });

        value.leave.next    = variable.enter;
        variable.leave.next = binding;

        binding.first = value.leave;
        binding.last  = variable.leave;

        value.leave.sibling = variable.leave;

        return new OpTree(value.enter, binding);
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

        lhs.leave.next = rhs.enter;
        rhs.leave.next = op;

        op.first = lhs.leave;
        op.last  = rhs.leave;

        lhs.leave.sibling = rhs.leave;

        return new OpTree(lhs.enter, op);
    }
}

// -----------------------------------------------------------------------------
