// =============================================================================
// Abstract Syntax Tree
// -----------------------------------------------------------------------------
// This will be the result of the Parse phase (when written) and represents the
// abstract syntax tree, with deparsing functionality
// =============================================================================

import { GlobSlot  } from '../Runtime/API'
import { ParseTree } from './TreeParser'

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
    BAREWORD      = 'BAREWORD',
    KEYWORD       = 'KEYWORD',
    PRAGMA        = 'PRAGMA',
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
    CALLSUB       = 'CALLSUB',

    // ------------------------------------
    // Statements
    // ------------------------------------
    STATEMENT     = 'STATEMENT',
    EXPRESSION    = 'EXPRESSION',

    // ------------------------------------
    // Constrol structures
    // ------------------------------------
    CONDITIONAL   = 'CONDITIONAL',
    CONDLOOP      = 'CONDLOOP',

    // ------------------------------------
    // Glob operations
    // ------------------------------------
    GLOBVAR       = 'GLOBVAR',
    GLOBFETCH     = 'GLOBFETCH',
    GLOBSTORE     = 'GLOBSTORE',
    GLOBDECLARE   = 'GLOBDECLARE',
}

export type NodeType = string;

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------

export interface NodeVisitor<T> {
    visit(n : Node) : T;
}

export interface Node {
    kind : NodeKind;

    deparse (depth? : number) : string;

    accept<T>(v : NodeVisitor<T>) : T;
}

// -----------------------------------------------------------------------------
// Nodes
// -----------------------------------------------------------------------------

// the base of everything ...
export abstract class AbstractNode implements Node {
    kind : NodeKind = NodeKind.ABSTRACT;

    constructor(public type : NodeType = this.constructor.name) {}

    abstract deparse (depth? : number) : string;

    accept<T>(v : NodeVisitor<T>) : T { return v.visit(this) }

    indent (depth : number) : string {
        if (depth == 0) return '';
        return "  ".repeat(depth);
    }
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

    deparse(depth : number = 0) : string {
        return `${this.items.map((i) => i.deparse()).join(', ')}`;
    }
}


export class ParenExpression extends ExpressionNode {
    override kind : NodeKind = NodeKind.EXPRESSION;

    constructor(
        public item : Node
    ) { super() }

    deparse(depth : number = 0) : string {
        return `(${this.item.deparse()})`;
    }
}

// -----------------------------------------------------------------------------
// Errors
// -----------------------------------------------------------------------------

export class ParserError extends AbstractNode {
    override kind : NodeKind = NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public args : Node[],
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `ErrorNode(${this.msg})`;
    }
}

export class TODO extends AbstractNode {
    override kind : NodeKind = NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `TODO(${this.msg})`;
    }
}

export class FIXME extends AbstractNode {
    override kind : NodeKind = NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `FIXME(${this.msg})`;
    }
}


export class HMMM extends AbstractNode {
    override kind : NodeKind = NodeKind.ABSTRACT;

    constructor(
        public tree : ParseTree,
        public msg  : string,
    ) { super() }

    deparse() : string {
        return `HMMM(${this.msg})`;
    }
}


// -----------------------------------------------------------------------------

export class Bareword extends AbstractNode {
    override kind : NodeKind = NodeKind.BAREWORD;

    constructor(public name : string) { super() }

    deparse(depth : number = 0) : string { return this.name }
}

export class Keyword extends AbstractNode {
    override kind : NodeKind = NodeKind.KEYWORD;

    constructor(public name : string) { super() }

    deparse(depth : number = 0) : string { return this.name }
}

// -----------------------------------------------------------------------------
// Compilation Unit
// -----------------------------------------------------------------------------

export abstract class Scope extends AbstractNode {
    override kind : NodeKind = NodeKind.SCOPE;

    constructor(public statements : Statement[]) { super() }

    deparse(depth : number = 0) : string {
        return this.statements
                //.map((s) => (typeof s) + ":" + s.deparse() + "####")
                .map((s) => s.deparse(depth + 1))
                .filter((s) => s.length > 0)
                .join('\n');
    }
}

// -----------------------------------------------------------------------------
// Programs
// -----------------------------------------------------------------------------

export class Program extends Scope {}

// -----------------------------------------------------------------------------
// Blocks
// -----------------------------------------------------------------------------

export class Block extends Scope {
    override deparse(depth : number = 0) : string {
        let src = super.deparse(depth);
        return '{\n' + src + '\n' + this.indent(depth - 1) + '}';
    }
}

// -----------------------------------------------------------------------------
// Subroutines ...
// -----------------------------------------------------------------------------

export class SubBody extends Block {}


// NOTE:
// I am calling them `params` now to indicate that it
// is nothing more than a list of variables. But this
// eventually needs to become a Signature object that
// can handle different types as well as slurpy args.
// But this is good enough for now.

export class SubDefinition extends AbstractNode {
    override kind : NodeKind = NodeKind.SUBDEFINITION;

    constructor(
        public ident  : Bareword,
        public params : ListExpression,
        public body   : SubBody,
    ) { super() }

    getParameters () : string[] {
        return this.params.items.map((p) => {
            return (p as any)?.name
        })
    }

    deparse(depth : number = 0) : string {
        return `sub ${this.ident.deparse()} ${this.params.deparse()} ${this.body.deparse(depth + 1)}`
    }
}

export class CallSub extends AbstractNode {
    override kind : NodeKind = NodeKind.CALLSUB;

    constructor(
        public callee : Bareword,
        public args   : Node[],
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.callee.name}(${this.args.map((a) => a.deparse()).join(', ')})`
    }
}

export class SubCall extends AbstractNode {
    override kind : NodeKind = NodeKind.SUBCALL;

    constructor(
        public glob : GlobFetch,
        public args : Node[],
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.glob.name}(${this.args.map((a) => a.deparse()).join(', ')})`
    }
}

export class SubReturn extends AbstractNode {
    override kind : NodeKind = NodeKind.SUBRETURN;

    constructor(public result : Node) { super() }

    deparse(depth : number = 0) : string { return `return ${this.result.deparse()}` }
}

// -----------------------------------------------------------------------------
// Statements
// -----------------------------------------------------------------------------

export class EmptyStatement extends AbstractNode {
    override kind : NodeKind = NodeKind.STATEMENT;

    deparse(depth : number = 0) : string { return ';' }
}

export class Statement extends AbstractNode {
    override kind : NodeKind = NodeKind.STATEMENT;

    constructor(public body : Node) {
        super();
    }

    deparse(depth : number = 0) : string {
        let src = this.body.deparse(depth);
        if (src.charAt(src.length - 1) != '}') {
            src = this.indent(depth) + src + ';';
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
        public keyword  : Keyword,
        public condExpr : ParenExpression,
        public ifTrue   : Block,
        public ifFalse  : Block = new Block([]),
    ) { super() }

    deparse(depth : number = 0) : string {
        if (this.ifFalse.statements.length == 0) {
            return [
                this.indent(depth),
                `${this.keyword.deparse()} ${this.condExpr.deparse()} `,
                    this.ifTrue.deparse(depth + 1)
            ].join('')
        } else {
            return [
                this.indent(depth),
                `${this.keyword.deparse()} ${this.condExpr.deparse()} `,
                    this.ifTrue.deparse(depth + 1),
                ' else ',
                    this.ifFalse.deparse(depth + 1),
            ].join('')
        }
    }
}

export class ConditionalLoop extends AbstractNode {
    override kind : NodeKind = NodeKind.CONDLOOP;

    constructor(
        public keyword  : Keyword,
        public condExpr : ParenExpression,
        public body     : Block,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.indent(depth)}${this.keyword.deparse()} ${this.condExpr.deparse()} ${this.body.deparse(depth + 1)}`;
    }
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export class ConstInt extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor(public literal : number) { super() }

    deparse(depth : number = 0) : string { return String(this.literal) }
}

export class ConstNumber extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor(public literal : number) { super() }

    deparse(depth : number = 0) : string { return String(this.literal) }
}

export class ConstStr extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor(public literal : string) { super() }

    deparse(depth : number = 0) : string { return `'${this.literal}'` }
}

export class ConstTrue extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor() { super() }

    deparse(depth : number = 0) : string { return 'true' }
}

export class ConstFalse extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor() { super() }

    deparse(depth : number = 0) : string { return 'false' }
}

export class ConstUndef extends AbstractNode {
    override kind : NodeKind = NodeKind.CONST;

    constructor() { super() }

    deparse(depth : number = 0) : string { return 'undef' }
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

    deparse(depth : number = 0) : string { return this.slot + this.name }
}

export class GlobFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.GLOBFETCH;

    constructor(
        public name : string,
        public slot : GlobSlot
    ) { super() }

    deparse(depth : number = 0) : string { return this.slot + this.name }
}

export class GlobStore extends AbstractNode {
    override kind : NodeKind = NodeKind.GLOBSTORE;

    constructor(
        public ident : GlobVar,
        public value : Node,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.ident.deparse()} = ${this.value.deparse()}`
    }
}

export class GlobDeclare extends GlobStore {
    override kind : NodeKind = NodeKind.GLOBDECLARE;

    override deparse (depth : number = 0) : string {
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

    deparse(depth : number = 0) : string { return '$' + this.name }
}

export class ScalarStore extends AbstractNode {
    override kind : NodeKind = NodeKind.STORE;

    constructor(
        public name  : string,
        public value : Node,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `$${this.name} = ${this.value.deparse()}`
    }
}

export class ScalarDeclare extends ScalarStore {
    override kind : NodeKind = NodeKind.DECLARE;

    override deparse (depth : number = 0) : string {
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

    deparse(depth : number = 0) : string {
        return `+[ ${this.items.map((i) => i.deparse()).join(', ')} ]`
    }
}

export class ArrayElemFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.ELEMFETCH;

    constructor(
        public name  : string,
        public index : Node,
    ) { super() }

    deparse(depth : number = 0) : string { return `@${this.name}[${this.index.deparse()}]` }
}

export class ArrayElemStore extends AbstractNode {
    override kind : NodeKind = NodeKind.ELEMSTORE;

    constructor(
        public name  : string,
        public index : Node,
        public value : Node,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `@${this.name}[${this.index.deparse()}] = ${this.value.deparse()}`
    }
}

export class ArrayFetch extends AbstractNode {
    override kind : NodeKind = NodeKind.FETCH;

    constructor(public name : string) { super() }

    deparse(depth : number = 0) : string { return '@' + this.name }
}

export class ArrayStore extends AbstractNode {
    override kind : NodeKind = NodeKind.STORE;

    constructor(
        public name  : string,
        public value : Node,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `@${this.name} = ${this.value.deparse()}`
    }
}

export class ArrayDeclare extends AbstractNode {
    override kind : NodeKind = NodeKind.DECLARE;

    constructor(
        public name  : string,
        public value : Node,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `my @${this.name} = (${this.value.deparse()})`
    }
}

// -----------------------------------------------------------------------------
// Pragma
// -----------------------------------------------------------------------------

export class Pragma extends AbstractNode {
    override kind : NodeKind = NodeKind.PRAGMA;

    constructor(
        public name : string, // TODO: make this an enum (use|no)
        public args : Node[],
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.name} (${this.args.map((a) => a.deparse()).join(', ')})`
    }
}

// -----------------------------------------------------------------------------
// Builtins
// -----------------------------------------------------------------------------

export abstract class BuiltIn extends AbstractNode {
    override kind : NodeKind = NodeKind.BUILTIN;
}

export class BuiltInUnary extends BuiltIn {
    override kind : NodeKind = NodeKind.BUILTIN;

    constructor(
        public name : string, // TODO: make this an enum or something
        public arg  : Node,
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.name}(${this.arg.deparse()})`
    }
}

export class BuiltInFunction extends BuiltIn {
    override kind : NodeKind = NodeKind.BUILTIN;

    constructor(
        public name : string, // TODO: make this an enum or something
        public args : Node[],
    ) { super() }

    deparse(depth : number = 0) : string {
        return `${this.name}(${this.args.map((a) => a.deparse()).join(', ')})`
    }
}

export class Say extends BuiltInFunction {
    constructor(args : Node[]) { super('say', args) }
}

export class Join extends BuiltInFunction {
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

    deparse(depth : number = 0) : string {
        return `${this.lhs.deparse()} ${this.operator} ${this.rhs.deparse()}`
    }
}

// -----------------------------------------------------------------------------
// String
// -----------------------------------------------------------------------------

export class Concat extends BinaryOp {
    constructor(lhs : Node, rhs : Node) {super('concat', '.', lhs, rhs) }
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
