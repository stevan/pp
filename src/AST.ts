// =============================================================================
// Abstract Syntax Tree
// -----------------------------------------------------------------------------
// This will be the result of the Parse phase (when written) and represents the
// abstract syntax tree, with deparsing functionality
//
// Currently this also implements kind of the first phase of a Compiler
// through the emit() method which constructions OpTree segments and
// stiches them together.
// =============================================================================

import {
    OP, NOOP, COP, UNOP, BINOP, LOGOP, LISTOP, OpTree
} from './Runtime'

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
    leave () : UNOP { return new UNOP('leavescope', {}) }

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
// Control Structures
// -----------------------------------------------------------------------------

export class Conditional implements Node {
    constructor(
        public predicate : Node,
        public ifTrue    : Block,
        public ifFalse   : Block,
    ) {}

    deparse() : string {
        return [
            `if (${this.predicate.deparse()})`,
                this.ifTrue.deparse().replace('\n', '\n  '),
            ' else ',
                this.ifFalse.deparse().replace('\n', '\n  '),
            ''
        ].join('\n')
    }

    emit () : OpTree {
        let condition   = this.predicate.emit();
        let trueBranch  = this.ifTrue.emit();
        let falseBranch = this.ifFalse.emit();

        let op = new LOGOP('cond_expr', {});

        condition.leave.next = op;

        op.first = condition.leave;
        op.other = trueBranch.enter;
        op.next  = falseBranch.enter;

        let goto = new UNOP('goto', {});

        trueBranch.leave.next  = goto;
        falseBranch.leave.next = goto;

        condition.leave.sibling = trueBranch.leave;
        trueBranch.leave.sibling = falseBranch.leave;

        goto.first = op;

        return new OpTree(condition.enter, goto);
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

export enum GlobSlot {
    SCALAR = '$',
    ARRAY  = '@',
    HASH   = '%',
    CODE   = '&',
}

export class GlobVar implements Node {
    constructor(
        public name : string,
        public slot : GlobSlot
    ) {}

    deparse() : string { return this.slot + this.name }

    emit () : OpTree {
        let op =  new UNOP('gv', {
            name : this.name,
            slot : this.slot,
        });
        return new OpTree(op, op)
    }
}

export class GlobFetch implements Node {
    constructor(
        public name : string,
        public slot : GlobSlot
    ) {}

    deparse() : string { return this.slot + this.name }

    emit () : OpTree {
        let op =  new UNOP('gv_fetch', {
            target : {
                name : this.name,
                slot : this.slot
            }
        });
        return new OpTree(op, op)
    }
}

export class GlobStore implements Node {
    constructor(
        public ident : GlobVar,
        public value : Node,
    ) {}

    deparse() : string {
        return `${this.ident.deparse()} = ${this.value.deparse()}`
    }

    emit () : OpTree {
        let value    = this.value.emit();
        let variable = this.ident.emit();
        let binding  = new BINOP('gv_store', {
            target    : variable.enter.config,
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

export class GlobDeclare extends GlobStore {

    override deparse () : string {
        let src = super.deparse();
        return `our ${src}`
    }

    override emit () : OpTree {
        let tree = super.emit();
        tree.leave.config.introduce = true;
        return tree;
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
            name : this.name,
        });
        return new OpTree(op, op)
    }
}

export class ScalarFetch implements Node {
    constructor(public name : string) {}

    deparse() : string { return '$' + this.name }

    emit () : OpTree {
        let op =  new UNOP('padsv_fetch', {
            target : { name : this.name },
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
            target    : variable.enter.config,
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
// Builtins
// -----------------------------------------------------------------------------

export class Say implements Node {
    constructor(
        public args : Node[]
    ) {}

    deparse() : string {
        return `say(${this.args.map((a) => a.deparse()).join(', ')})`
    }

    emit () : OpTree {
        let op       = new LISTOP('say', {});
        let pushmark = new OP('pushmark', {});

        op.first = pushmark;

        let curr = pushmark;
        for (const arg of this.args) {
            let a = arg.emit();

            curr.next    = a.enter;
            curr.sibling = a.leave;

            curr = a.leave;
        }
        curr.next = op;

        return new OpTree(pushmark, op);
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

export class Eq implements Node {
    constructor(
        public lhs : Node,
        public rhs : Node,
    ) {}

    deparse() : string {
        return `${this.lhs.deparse()} == ${this.rhs.deparse()}`
    }

    emit () : OpTree {
        let lhs = this.lhs.emit();
        let rhs = this.rhs.emit();
        let op  = new BINOP('eq', { operation : '==' });

        lhs.leave.next = rhs.enter;
        rhs.leave.next = op;

        op.first = lhs.leave;
        op.last  = rhs.leave;

        lhs.leave.sibling = rhs.leave;

        return new OpTree(lhs.enter, op);
    }
}

// -----------------------------------------------------------------------------
