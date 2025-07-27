// =============================================================================
// Abstract Syntax Tree
// -----------------------------------------------------------------------------
// This will be the result of the Parse phase (when written) and represents the
// abstract syntax tree, with deparsing functionality
// =============================================================================

import { GlobSlot } from '../Runtime/API'

// -----------------------------------------------------------------------------
// Node Kind
// -----------------------------------------------------------------------------
// So we have a bunch of generic Node kinds (which are different than the
// node "type" (which is basically the class)), a kind is more of a category
// to which the Node fits. This should make dispatching in an AST visitor
// cleaner since often times the same code will be shared across the same
// kinds of AST nodes (ex - most all bin-ops will be processed the same).
// And if specialization is needed, then it can be more localized and not
// require complex code paths.
// -----------------------------------------------------------------------------

export enum NodeKind {
    ABSTRACT = 'ABSTRACT',
    // ------------------------------------
    // generic node types
    // ------------------------------------
    SCOPE         = 'SCOPE',
    CONST         = 'CONST',
    LITERAL       = 'LITERAL',
    BUILTIN       = 'BUILTIN',
    BINARYOP      = 'BINARYOP',
    FETCH         = 'FETCH',
    STORE         = 'STORE',
    DECLARE       = 'DECLARE',
    ELEMFETCH     = 'ELEMFETCH',
    ELEMSTORE     = 'ELEMSTORE',

    // ------------------------------------
    // Subroutines
    // ------------------------------------
    // NOTE:
    // The DEFINITION type should also be
    // made generic, and CALL/RETURN could
    // be generic once we have methods.
    // ------------------------------------
    SUBDEFINITION = 'SUBDEFINITION',
    SUBCALL       = 'SUBCALL',
    SUBRETURN     = 'SUBRETURN',

    // ------------------------------------
    // Statements
    // ------------------------------------
    STATEMENT     = 'STATEMENT',
    EXPRESSION    = 'EXPRESSION',

    // ------------------------------------
    // Constrol structures
    // ------------------------------------
    CONDITIONAL   = 'CONDITIONAL',
    FOREACHLOOP   = 'FOREACHLOOP',

    // ------------------------------------
    // Glob operations
    // ------------------------------------
    GLOBVAR       = 'GLOBVAR',
    GLOBFETCH     = 'GLOBFETCH',
    GLOBSTORE     = 'GLOBSTORE',
    GLOBDECLARE   = 'GLOBDECLARE',
}

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export interface NodeVisitor<T> {
    visit(n : Node) : T;
}

export interface Node {
    kind : NodeKind;

    deparse () : string;

    accept<T>(v : NodeVisitor<T>) : T;
}

// -----------------------------------------------------------------------------
// Nodes
// -----------------------------------------------------------------------------

// the base of everything ...
export abstract class AbstractNode implements Node {
    kind : NodeKind = NodeKind.ABSTRACT;

    abstract deparse () : string;

    accept<T>(v : NodeVisitor<T>) : T { return v.visit(this) }
}

// -----------------------------------------------------------------------------
// Synthetic Nodes
// -----------------------------------------------------------------------------

export abstract class ExpressionNode extends AbstractNode {
    override kind : NodeKind = NodeKind.EXPRESSION;
}

export class ListExpression extends ExpressionNode {
    override kind : NodeKind = NodeKind.EXPRESSION;

    constructor(
        public items : Node[]
    ) { super() }

    deparse() : string {
        return `${this.items.map((i) => i.deparse()).join(', ')}`;
    }
}


export class ParenExpression extends ExpressionNode {
    override kind : NodeKind = NodeKind.EXPRESSION;

    constructor(
        public item : Node
    ) { super() }

    deparse() : string {
        return `(${this.item.deparse()})`;
    }
}

// -----------------------------------------------------------------------------
// Compilation Unit
// -----------------------------------------------------------------------------

export abstract class Scope extends AbstractNode {
    override kind : NodeKind = NodeKind.SCOPE;

    constructor(public statements : Statement[]) { super() }

    deparse() : string {
        return this.statements
                //.map((s) => (typeof s) + ":" + s.deparse() + "####")
                .map((s) => s.deparse())
                .filter((s) => s.length > 0)
                .join('\n');
    }
}

export class Program extends Scope {}

export class Block extends Scope {
    override deparse() : string {
        let src = super.deparse();
        return '{\n' + src + '\n}';
    }
}

// -----------------------------------------------------------------------------
// Subroutines ...
// -----------------------------------------------------------------------------

export class SubBody extends Scope {
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

export class SubDefinition extends AbstractNode {
    override kind : NodeKind = NodeKind.SUBDEFINITION;

    public name   : string;
    public params : string[];
    public body   : SubBody;

    constructor(
        name   : string,
        params : string[],
        body   : Statement[],
    ) {
        super();
        this.name   = name;
        this.params = params;
        this.body   = new SubBody(body);
    }

    deparse() : string {
        return `sub ${this.name} (${this.params.join(', ')}) ${this.body.deparse()}`
    }
}

export class SubCall extends AbstractNode {
    override kind : NodeKind = NodeKind.SUBCALL;

    constructor(
        public glob : GlobFetch,
        public args : Node[],
    ) { super() }

    deparse() : string {
        return `${this.glob.name}(${this.args.map((a) => a.deparse()).join(', ')})`
    }
}

export class SubReturn extends AbstractNode {
    override kind : NodeKind = NodeKind.SUBRETURN;

    constructor(public result : Node) { super() }

    deparse() : string { return `return ${this.result.deparse()}` }
}

// -----------------------------------------------------------------------------
// Statements
// -----------------------------------------------------------------------------

export class Statement extends AbstractNode {
    override kind : NodeKind = NodeKind.STATEMENT;

    constructor(public body : Node, public internal : boolean = false) {
        super();
    }

    deparse() : string {
        if (this.internal) return '';
        let src = this.body.deparse();
        if (src.charAt(src.length - 1) != '}') {
            src = src + ';';
        }
        return src;
    }
}

// -----------------------------------------------------------------------------
// Control Structures
// -----------------------------------------------------------------------------

export class Conditional extends AbstractNode {
    override kind : NodeKind = NodeKind.CONDITIONAL;

    constructor(
        public predicate : Node,
        public ifTrue    : Block,
        public ifFalse   : Block,
    ) { super() }

    deparse() : string {
        return [
            `if (${this.predicate.deparse()})`,
                this.ifTrue.deparse(),
            'else',
                this.ifFalse.deparse(),
        ]
        .join('\n')
    }
}

export class ForEachLoop extends AbstractNode {
    override kind : NodeKind = NodeKind.FOREACHLOOP;

    constructor(
        public local : string, // TODO: make this Var object
        public iter  : Node,   // TODO: make this something
        public body  : Block,
    ) { super() }

    deparse() : string {
        return [
            `foreach my $${this.local} (${this.iter.deparse()})`,
                this.body.deparse(),
        ]
        .join('\n')
    }
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export class ConstInt extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor(public literal : number) { super() }

    deparse() : string { return String(this.literal) }
}

export class ConstNumber extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor(public literal : number) { super() }

    deparse() : string { return String(this.literal) }
}

export class ConstStr extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor(public literal : string) { super() }

    deparse() : string { return `'${this.literal}'` }
}

export class ConstTrue extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor() { super() }

    deparse() : string { return 'true' }
}

export class ConstFalse extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor() { super() }

    deparse() : string { return 'false' }
}

export class ConstUndef extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor() { super() }

    deparse() : string { return 'undef' }
}

// -----------------------------------------------------------------------------
// Glob Ops
// -----------------------------------------------------------------------------
// FIXME: These are all wrong!

export class GlobVar extends AbstractNode {
    override kind : NodeKind = NodeKind.GLOBVAR;

    constructor(
        public name : string,
        public slot : GlobSlot
    ) { super() }

    deparse() : string { return this.slot + this.name }
}

export class GlobFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.GLOBFETCH;

    constructor(
        public name : string,
        public slot : GlobSlot
    ) { super() }

    deparse() : string { return this.slot + this.name }
}

export class GlobStore extends AbstractNode {
    override kind : NodeKind = NodeKind.GLOBSTORE;

    constructor(
        public ident : GlobVar,
        public value : Node,
    ) { super() }

    deparse() : string {
        return `${this.ident.deparse()} = ${this.value.deparse()}`
    }
}

export class GlobDeclare extends GlobStore {
    override kind : NodeKind = NodeKind.GLOBDECLARE;

    override deparse () : string {
        let src = super.deparse();
        return `our ${src}`
    }
}

// -----------------------------------------------------------------------------
// Scalar Ops
// -----------------------------------------------------------------------------

export class ScalarFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.FETCH;

    constructor(public name : string) { super() }

    deparse() : string { return '$' + this.name }
}

export class ScalarStore extends AbstractNode {
    override kind : NodeKind = NodeKind.STORE;

    constructor(
        public name  : string,
        public value : Node,
    ) { super() }

    deparse() : string {
        return `$${this.name} = ${this.value.deparse()}`
    }
}

export class ScalarDeclare extends ScalarStore {
    override kind : NodeKind = NodeKind.DECLARE;

    override deparse () : string {
        let src = super.deparse();
        return `my ${src}`
    }
}

// -----------------------------------------------------------------------------
// Array Ops
// -----------------------------------------------------------------------------

export class ArrayLiteral extends AbstractNode {
    override kind : NodeKind = NodeKind.LITERAL;

    constructor(
        public items : Node[],
    ) { super() }

    deparse() : string {
        return `+[ ${this.items.map((i) => i.deparse()).join(', ')} ]`
    }
}

export class ArrayElemFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.ELEMFETCH;

    constructor(
        public name  : string,
        public index : Node,
    ) { super() }

    deparse() : string { return `@${this.name}[${this.index.deparse()}]` }
}

export class ArrayElemStore extends AbstractNode {
    override kind : NodeKind = NodeKind.ELEMSTORE;

    constructor(
        public name  : string,
        public index : Node,
        public value : Node,
    ) { super() }

    deparse() : string {
        return `@${this.name}[${this.index.deparse()}] = ${this.value.deparse()}`
    }
}

export class ArrayFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.FETCH;

    constructor(public name : string) { super() }

    deparse() : string { return '@' + this.name }
}

export class ArrayStore extends AbstractNode {
    override kind : NodeKind = NodeKind.STORE;

    constructor(
        public name  : string,
        public value : Node,
    ) { super() }

    deparse() : string {
        return `@${this.name} = ${this.value.deparse()}`
    }
}

export class ArrayDeclare extends AbstractNode {
    override kind : NodeKind = NodeKind.DECLARE;

    constructor(
        public name  : string,
        public value : Node,
    ) { super() }

    deparse() : string {
        return `my @${this.name} = (${this.value.deparse()})`
    }
}

// -----------------------------------------------------------------------------
// Builtins
// -----------------------------------------------------------------------------

export class BuiltIn extends AbstractNode {
    override kind : NodeKind = NodeKind.BUILTIN;

    constructor(
        public name : string, // TODO: make this an enum or something
        public args : Node[],
    ) { super() }

    deparse() : string {
        return `${this.name}(${this.args.map((a) => a.deparse()).join(', ')})`
    }
}

export class Say extends BuiltIn {
    constructor(args : Node[]) { super('say', args) }
}

export class Join extends BuiltIn {
    constructor(args : Node[]) { super('join', args) }
}

// -----------------------------------------------------------------------------
// Binary Ops
// -----------------------------------------------------------------------------

export class BinaryOp extends AbstractNode {
    override kind : NodeKind = NodeKind.BINARYOP;

    constructor(
        public name     : string, // TODO: make this an enum or something
        public operator : string, // TODO: make this an enum or something
        public lhs      : Node,
        public rhs      : Node,
    ) { super() }

    deparse() : string {
        return `${this.lhs.deparse()} ${this.operator} ${this.rhs.deparse()}`
    }
}

// -----------------------------------------------------------------------------
// Math
// -----------------------------------------------------------------------------

export class Add extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('add', '+', lhs, rhs) }
}

export class Multiply extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('multiply', '*', lhs, rhs) }
}

export class Subtract extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('subtract', '-', lhs, rhs) }
}

export class Divide extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('modulus', '%', lhs, rhs) }
}

export class Modulus extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('modulus', '%', lhs, rhs) }
}

// -----------------------------------------------------------------------------
// Equality
// -----------------------------------------------------------------------------

export class Equal extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('eq', '==', lhs, rhs) }
}

export class NotEqual extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('ne', '!=', lhs, rhs) }
}

// -----------------------------------------------------------------------------
// Ordering
// -----------------------------------------------------------------------------

export class LessThan extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('lt', '<', lhs, rhs) }
}

export class GreaterThan extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('gt', '>', lhs, rhs) }
}

export class LessThanOrEqual extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('le', '<=', lhs, rhs) }
}

export class GreaterThanOrEqual extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('ge', '>=', lhs, rhs) }
}

// -----------------------------------------------------------------------------
