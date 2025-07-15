
import {
    GlobSlot
} from './SymbolTable'

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

export abstract class Scope implements Node {
    constructor(public statements : Statement[]) { }

    deparse() : string {
        return this.statements.map((s) => s.deparse()).join('\n');
    }

    abstract enter () : OP;
    abstract leave () : UNOP;

    emit () : OpTree {
        let enter = this.enter();
        let leave = this.leave();

        leave.first = enter;

        let curr = enter;
        for (const statement of this.statements) {
            let s = statement.emit();

            curr.next    = s.enter;
            curr.sibling = s.enter;
            curr         = s.leave;
        }

        curr.next = leave;

        return new OpTree(enter, leave);
    }
}

export class Program extends Scope {
    enter () : OP   { return new OP('enter', {}) }
    leave () : UNOP { return new UNOP('leave', { halt : true }) }
}

export class Block extends Scope {
    enter () : OP   { return new OP('enterscope', {}) }
    leave () : UNOP { return new UNOP('leavescope', { halt : true }) }

    override deparse() : string {
        let src = super.deparse();
        return '{\n  ' + src.replace('\n', '\n  ') + '\n}';
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
        s.next    = n.enter;
        s.sibling = n.leave;
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

export class Undef implements Node {
    deparse() : string { return 'undef' }

    emit () : OpTree {
        let op = new OP('undef', {})
        return new OpTree(op, op)
    }
}

// -----------------------------------------------------------------------------
// Glob Ops
// -----------------------------------------------------------------------------

export class GlobVar implements Node {
    constructor(
        public name : string,
        public slot : GlobSlot = GlobSlot.NONE,
    ) {}

    deparse() : string { return this.slot + this.name }

    emit () : OpTree {
        let op =  new UNOP('gv', {
            target : this.name,
            slot   : this.slot,
        });
        return new OpTree(op, op)
    }
}

// -----------------------------------------------------------------------------
// Scalar Ops
// -----------------------------------------------------------------------------

export class ScalarVar implements Node {
    constructor(public name : string) {}

    deparse() : string { return '$' + this.name }

    emit () : OpTree {
        let op =  new UNOP('padsv', {
            target : this.name,
        });
        return new OpTree(op, op)
    }
}

export class ScalarFetch implements Node {
    constructor(public name : string) {}

    deparse() : string { return '$' + this.name }

    emit () : OpTree {
        let op =  new UNOP('padsv_fetch', {
            target : this.name,
        });
        return new OpTree(op, op)
    }
}

export class ScalarStore implements Node {
    constructor(
        public ident : ScalarVar,
        public value : Node,
    ) {}

    deparse() : string {
        return `${this.ident.deparse()} = ${this.value.deparse()}`
    }

    emit () : OpTree {
        let value    = this.value.emit();
        let variable = this.ident.emit();
        let binding  = new BINOP('padsv_store', {
            operation : '=',
            target    : this.ident.name,
            introduce : false,
        });

        value.leave.next    = variable.enter;
        variable.leave.next = binding;

        binding.first = value.leave;
        binding.last  = variable.leave;

        value.leave.sibling = variable.leave;

        return new OpTree(value.enter, binding);
    }
}

export class ScalarDeclare extends ScalarStore {

    override deparse () : string {
        let src = super.deparse();
        return `my ${src}`
    }

    override emit () : OpTree {
        let tree = super.emit();
        tree.leave.config.introduce = true;
        return tree;
    }
}

// -----------------------------------------------------------------------------
// Binary Ops
// -----------------------------------------------------------------------------

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
