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
    OP, NOOP, COP, UNOP, BINOP, LOGOP, LISTOP, DECLARE, OpTree
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
        return this.statements
                //.map((s) => (typeof s) + ":" + s.deparse() + "####")
                .map((s) => s.deparse())
                .filter((s) => s.length > 0)
                .join('\n');
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
    leave () : UNOP { return new UNOP('leave', {}) }
}

export class Block extends Scope {
    enter () : OP   { return new OP('enterscope', {}) }
    leave () : UNOP { return new UNOP('leavescope', {}) }

    override deparse() : string {
        let src = super.deparse();
        return '{\n' + src + '\n}';
    }
}

// -----------------------------------------------------------------------------
// Subroutines ...
// -----------------------------------------------------------------------------

export class SubBody extends Scope {
    enter () : OP   { return new OP('entersub', {}) }
    leave () : UNOP { return new UNOP('leavesub', {}) }

    override deparse() : string {
        let src = super.deparse();
        return '{\n' + src + '\n}';
    }
}

// NOTE:
// I am calling them `params` now to indicate that it
// is nothing more than a list of variables. But this
// eventually needs to become a Signature object that
// can handle different types as well as slurpy args.
// But this is good enough for now.

export class SubDefinition implements Node {
    public name   : string;
    public params : ScalarVar[];
    public body   : SubBody;

    constructor(
        name   : string,
        params : ScalarVar[], // XXX: support other types
        body   : Statement[],
    ) {
        this.name   = name;
        this.params = params;
        this.body   = new SubBody(body);
    }

    deparse() : string {
        return `sub ${this.name} (${this.params.map((p) => p.deparse()).join(', ')}) ${this.body.deparse()}`
    }

    emit () : OpTree {
        let body = this.body.emit();

        body.enter.config.name   = this.name;
        body.enter.config.params = this.params.map((v) => v.name);

        let op = new DECLARE( body, { name : this.name } );
        return new OpTree(op, op)
    }
}

export class SubCall implements Node {
    constructor(
        public glob : GlobFetch,
        public args : Node[],
    ) {}

    deparse() : string {
        return `${this.glob.name}(${this.args.map((a) => a.deparse()).join(', ')})`
    }

    emit () : OpTree {
        let glob     = this.glob.emit();
        let op       = new LISTOP('callsub', {});
        let pushmark = new OP('pushmark', {});

        op.first = pushmark;

        let curr = pushmark;
        for (const arg of this.args) {
            let a = arg.emit();

            curr.next    = a.enter;
            curr.sibling = a.leave;

            curr = a.leave;
        }
        curr.next    = glob.enter;
        curr.sibling = glob.leave;

        glob.leave.next = op;

        return new OpTree(pushmark, op);
    }
}

export class SubReturn implements Node {
    constructor(public result : Node) {}

    deparse() : string { return `return ${this.result.deparse()}` }

    emit () : OpTree {
        let result = this.result.emit();
        let op     = new UNOP('return', {})

        result.leave.next = op;

        op.first = result.leave;

        return new OpTree(result.enter, op)
    }
}

// -----------------------------------------------------------------------------
// Statements
// -----------------------------------------------------------------------------

export class Statement implements Node {
    constructor(public body : Node, public internal : boolean = false) {}

    deparse() : string {
        if (this.internal) return '';
        let src = this.body.deparse();
        if (src.charAt(src.length - 1) != '}') {
            src = src + ';';
        }
        return src;
    }

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
                this.ifTrue.deparse(),
            'else',
                this.ifFalse.deparse(),
        ]
        .join('\n')
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
        let op = new OP('const', {
            literal : this.literal,
            type    : 'IV'
        })
        return new OpTree(op, op)
    }
}

export class ConstFloat implements Node {
    constructor(public literal : number) {}

    deparse() : string { return String(this.literal) }

    emit () : OpTree {
        let op = new OP('const', {
            literal : this.literal,
            type    : 'NV'
        })
        return new OpTree(op, op)
    }
}

export class ConstStr implements Node {
    constructor(public literal : string) {}

    deparse() : string { return `'${this.literal}'` }

    emit () : OpTree {
        let op = new OP('const', { literal : this.literal, type : 'PV' })
        return new OpTree(op, op)
    }
}

export class ConstTrue implements Node {
    deparse() : string { return 'true' }

    emit () : OpTree {
        let op = new OP('true', {})
        return new OpTree(op, op)
    }
}

export class ConstFalse implements Node {
    deparse() : string { return 'false' }

    emit () : OpTree {
        let op = new OP('false', {})
        return new OpTree(op, op)
    }
}

export class ConstUndef implements Node {
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

function SigilToSlot (sigil : GlobSlot) : string {
    switch (sigil) {
    case '$' : return 'SCALAR';
    case '@' : return 'ARRAY';
    case '%' : return 'HASH';
    case '&' : return 'CODE';
    default:
        throw new Error("WTF");
    }
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
            slot : SigilToSlot(this.slot),
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
                slot : SigilToSlot(this.slot),
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

export abstract class BuiltIn implements Node {
    constructor(
        public op   : LISTOP,
        public args : Node[],
    ) {}

    deparse() : string {
        return `${this.op.config.builtin}(${this.args.map((a) => a.deparse()).join(', ')})`
    }

    emit () : OpTree {
        let op       = this.op;
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

export class Say extends BuiltIn {
    constructor(args : Node[]) {
        super(new LISTOP('say', { builtin : 'say' }), args)
    }
}

export class Join extends BuiltIn {
    constructor(args : Node[]) {
        super(new LISTOP('join', { builtin : 'join' }), args)
    }
}

// -----------------------------------------------------------------------------
// Binary Ops
// -----------------------------------------------------------------------------

export class BinaryOp implements Node {
    constructor(
        public op  : BINOP,
        public lhs : Node,
        public rhs : Node,
    ) {}

    deparse() : string {
        return `${this.lhs.deparse()} ${this.op.config.operation} ${this.rhs.deparse()}`
    }

    emit () : OpTree {
        let lhs = this.lhs.emit();
        let rhs = this.rhs.emit();
        let op  = this.op;

        lhs.leave.next = rhs.enter;
        rhs.leave.next = op;

        op.first = lhs.leave;
        op.last  = rhs.leave;

        lhs.leave.sibling = rhs.leave;

        return new OpTree(lhs.enter, op);
    }
}

// -----------------------------------------------------------------------------
// Math
// -----------------------------------------------------------------------------

export class Add extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('add', { operation : '+' }), lhs, rhs)
    }
}

export class Multiply extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('multiply', { operation : '*' }), lhs, rhs)
    }
}

export class Subtract extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('subtract', { operation : '-' }), lhs, rhs)
    }
}

// -----------------------------------------------------------------------------
// Equality
// -----------------------------------------------------------------------------

export class Equal extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('eq', { operation : '==' }), lhs, rhs)
    }
}

export class NotEqual extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('ne', { operation : '!=' }), lhs, rhs)
    }
}

// -----------------------------------------------------------------------------
// Ordering
// -----------------------------------------------------------------------------

export class LessThan extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('lt', { operation : '<' }), lhs, rhs)
    }
}

export class GreaterThan extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('gt', { operation : '>' }), lhs, rhs)
    }
}

export class LessThanOrEqual extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('le', { operation : '<=' }), lhs, rhs)
    }
}

export class GreaterThanOrEqual extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {
        super(new LISTOP('ge', { operation : '>=' }), lhs, rhs)
    }
}

// -----------------------------------------------------------------------------
