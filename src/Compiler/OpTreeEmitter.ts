// =============================================================================
// OpTree Builder
// -----------------------------------------------------------------------------
// this is the heart of the compiler
// =============================================================================

import {
    NodeVisitor, Node, NodeKind,
    Scope,
    Program, Block, Statement,
    ExpressionNode, ListExpression, ParenExpression,
    Bareword,
    SubBody, SubDefinition, SubCall, SubReturn, CallSub,
    Conditional,
    ConstInt, ConstNumber, ConstStr, ConstTrue, ConstFalse, ConstUndef,
    GlobFetch, GlobStore, GlobDeclare, GlobVar,
    ScalarFetch, ScalarStore, ScalarDeclare,
    ArrayFetch, ArrayStore, ArrayDeclare, ArrayLiteral,
    ArrayElemFetch, ArrayElemStore,
    BuiltIn, BuiltInFunction, BuiltInUnary, Say, Join,
    BinaryOp, Add, Multiply, Subtract, Modulus,
    Equal, NotEqual,
    LessThan, GreaterThan, LessThanOrEqual, GreaterThanOrEqual,
} from '../Parser/AST'

import {
    OP, COP, UNOP, BINOP, LOGOP, LISTOP, LOOPOP,
    NOOP, DECLARE,
    OpTree,
    GlobSlot,
} from '../Runtime/API'

export class OpTreeEmitter implements NodeVisitor<OpTree> {

    // -------------------------------------------------------------------------

    emitScope (node : Scope) : OpTree {
        let enter : OP;
        let leave : UNOP;

        switch (true) {
        case node instanceof Program:
            enter = new OP('enter', {});
            leave = new UNOP('leave', {});
            break;
        case node instanceof SubBody:
            enter = new OP('entersub', {});
            leave = new UNOP('leavesub', {});
            break;
        case node instanceof Block:
            enter = new OP('enterscope', {});
            leave = new UNOP('leavescope', {});
            break;
        default:
            throw new Error(`Unrecognized Node(${JSON.stringify(node)})`)
        }

        leave.first = enter;

        let curr = enter;
        for (const statement of node.statements) {
            let s = this.visit(statement);

            curr.next    = s.enter;
            curr.sibling = s.enter;
            curr         = s.leave;
        }

        curr.next = leave;

        return new OpTree(enter, leave);
    }

    // -------------------------------------------------------------------------

    emitConst (node : Node) : OpTree {
        let op : OP;
        switch (true) {
        case node instanceof ConstInt:
            op = new OP('const', { literal : node.literal, type : 'IV' });
            break;
        case node instanceof ConstNumber:
            op = new OP('const', { literal : node.literal, type : 'NV' });
            break;
        case node instanceof ConstStr:
            op = new OP('const', { literal : node.literal, type : 'PV' });
            break;
        case node instanceof ConstTrue:
            op = new OP('true', {});
            break;
        case node instanceof ConstFalse:
            op = new OP('false', {});
            break;
        case node instanceof ConstUndef:
            op = new OP('undef', {});
            break;
        default:
            throw new Error(`Unrecognized Node(${JSON.stringify(node)})`)
        }

        return new OpTree(op, op)
    }

    // -------------------------------------------------------------------------

    emitBuiltIn (node : BuiltIn) : OpTree {
        if (node instanceof BuiltInFunction) {
            let op       = new LISTOP(node.name, { builtin : true });
            let pushmark = new OP('pushmark', {});

            op.first = pushmark;

            let curr = pushmark;
            for (const arg of node.args) {
                let a = this.visit(arg);

                curr.next    = a.enter;
                curr.sibling = a.leave;

                curr = a.leave;
            }

            curr.next = op;

            return new OpTree(pushmark, op);
        }
        else if (node instanceof BuiltInUnary) {
            let arg = this.visit(node.arg);
            let op  = new UNOP(node.name, { builtin : true });

            arg.leave.next = op;
            op.first       = arg.leave;

            return new OpTree(arg.enter, op);
        }
        else {
            throw new Error('Unrecognized BUILTIN type');
        }
    }

    // -------------------------------------------------------------------------

    emitBinaryOp (node : BinaryOp) : OpTree {
        let lhs = this.visit(node.lhs);
        let rhs = this.visit(node.rhs);
        let op  = new BINOP(node.name, { operator : node.operator });

        lhs.leave.next = rhs.enter;
        rhs.leave.next = op;

        op.first = lhs.leave;
        op.last  = rhs.leave;

        lhs.leave.sibling = rhs.leave;

        return new OpTree(lhs.enter, op);
    }

    // -------------------------------------------------------------------------

    emitFetch (node : Node) : OpTree {
        let op : OP;
        switch (true) {
        case node instanceof ScalarFetch:
            op =  new OP('padsv_fetch', { target : { name : node.name } });
            break;
        case node instanceof ArrayFetch:
            op =  new OP('padav_fetch', { target : { name : node.name } });
            break;
        default:
            throw new Error(`Unrecognized Node(${JSON.stringify(node)})`)
        }

        return new OpTree(op, op);
    }

    emitStore (node : Node) : OpTree {
        let op : UNOP;
        switch (true) {
        case (node instanceof ScalarStore || node instanceof ScalarDeclare):
            op = new UNOP('padsv_store', {
                target    : { name : node.name },
                introduce : false,
            });
            break;
        case (node instanceof ArrayStore || node instanceof ArrayDeclare):
            op = new UNOP('padav_store', {
                target    : { name : node.name },
                introduce : false,
            });
            break;
        default:
            throw new Error(`Unrecognized Node(${JSON.stringify(node)})`)
        }

        let value = this.visit(node.value);

        value.leave.next = op;
        op.first         = value.leave;

        return new OpTree(value.enter, op);
    }

    emitDeclare (node : Node) : OpTree {
        if (node instanceof ScalarDeclare) {
            let tree = this.emitStore(node);
            tree.leave.config.introduce = true;
            return tree;
        }
        else if (node instanceof ArrayDeclare) {
            let tree = this.emitStore(node);
            tree.leave.config.introduce = true;
            return tree;
        }
        else {
            throw new Error(`Unrecognized Node(${JSON.stringify(node)})`)
        }
    }

    emitLiteral (node : Node) : OpTree {
        if (node instanceof ArrayLiteral) {
            let op = new UNOP('array_literal', {
                length : node.items.length,
            });

            let pushmark = new OP('pushmark', {});

            op.first = pushmark;

            let curr = pushmark;
            for (const item of node.items) {
                let i = this.visit(item);

                curr.next    = i.enter;
                curr.sibling = i.leave;

                curr = i.leave;
            }
            curr.next = op;

            return new OpTree(pushmark, op);
        }
        else {
            throw new Error(`Unrecognized Node(${JSON.stringify(node)})`)
        }
    }

    // -------------------------------------------------------------------------

    emitElemFetch (node : ArrayElemFetch) : OpTree {
        let index = this.visit(node.index);
        let op    = new UNOP('padav_elem_fetch', {
            target : { name : node.name },
        });

        index.leave.next = op;
        op.first         = index.leave;

        return new OpTree(index.enter, op);
    }

    emitElemStore (node : ArrayElemStore) : OpTree {
        let index   = this.visit(node.index);
        let value   = this.visit(node.value);
        let binding = new BINOP('padav_elem_store', {
            target    : { name : node.name },
            introduce : false,
        });

        index.leave.next    = value.enter;
        index.leave.sibling = value.leave;
        value.leave.next    = binding;
        binding.first       = index.leave;

        return new OpTree(index.enter, binding);
    }

    // -------------------------------------------------------------------------

    emitSubDefinition (node : SubDefinition) : OpTree {
        let body = this.visit(node.body);

        body.enter.config.name   = node.name;
        body.enter.config.params = node.params;

        let op = new DECLARE( body, { name : node.name } );
        return new OpTree(op, op)
    }

    emitCallSub (node : CallSub) : OpTree {
        let glob = new OP('gv_fetch', {
            target : {
                name : node.callee.name,
                slot : GlobSlot.CODE,
            }
        });

        let op       = new LISTOP('callsub', { name : node.callee.name });
        let pushmark = new OP('pushmark', {});

        op.first = pushmark;

        let curr = pushmark;
        for (const arg of node.args) {
            let a = this.visit(arg);

            curr.next    = a.enter;
            curr.sibling = a.leave;

            curr = a.leave;
        }
        curr.next    = glob;
        curr.sibling = glob;

        glob.next = op;

        return new OpTree(pushmark, op);
    }

    // TODO - remove me ...
    emitSubCall (node : SubCall) : OpTree {
        let glob     = this.visit(node.glob);
        let op       = new LISTOP('callsub', { name : node.glob.name });
        let pushmark = new OP('pushmark', {});

        op.first = pushmark;

        let curr = pushmark;
        for (const arg of node.args) {
            let a = this.visit(arg);

            curr.next    = a.enter;
            curr.sibling = a.leave;

            curr = a.leave;
        }
        curr.next    = glob.enter;
        curr.sibling = glob.leave;

        glob.leave.next = op;

        return new OpTree(pushmark, op);
    }

    emitSubReturn (node : SubReturn) : OpTree {
        let result = this.visit(node.result);
        let op     = new UNOP('return', {})

        result.leave.next = op;

        op.first = result.leave;

        return new OpTree(result.enter, op)
    }

    // -------------------------------------------------------------------------

    emitStatement (node : Statement) : OpTree {
        let s = new COP();
        let n = this.visit(node.body);
        s.next    = n.enter;
        s.sibling = n.leave;
        return new OpTree(s, n.leave);
    }

    emitExpression (node : ExpressionNode) : OpTree {
        if (node instanceof ParenExpression) {
            return this.visit(node.item);
        }
        else if (node instanceof ListExpression) {
            let op = new LISTOP('list', {});
            let pushmark = new OP('pushmark', {});

            op.first = pushmark;

            let curr = pushmark;
            for (const item of node.items) {
                let i = this.visit(item);

                curr.next    = i.enter;
                curr.sibling = i.leave;

                curr = i.leave;
            }
            curr.next = op;

            return new OpTree(pushmark, op);
        }
        else {
            throw new Error("Unkown ExpressionNode type");
        }
    }

    // -------------------------------------------------------------------------

    emitConditional (node : Conditional) : OpTree {
        let condition   = this.visit(node.condExpr.item);
        let trueBranch  = this.visit(node.ifTrue);
        let falseBranch = this.visit(node.ifFalse);

        if (node.keyword.name == 'unless') {
            [ trueBranch, falseBranch ] = [ falseBranch, trueBranch ];
        }

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

    // -------------------------------------------------------------------------

    emitGlobVar (node : GlobVar) : OpTree {
        let op =  new OP('gv', {
            name : node.name,
            slot : node.slot,
        });
        return new OpTree(op, op);
    }

    emitGlobFetch (node : GlobFetch) : OpTree {
        let op =  new OP('gv_fetch', {
            target : {
                name : node.name,
                slot : node.slot,
            }
        });
        return new OpTree(op, op);
    }

    emitGlobStore (node : GlobStore) : OpTree {
        let value    = this.visit(node.value);
        let variable = this.visit(node.ident);
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

    emitGlobDeclare (node : GlobDeclare) : OpTree {
        let tree = this.emitGlobStore(node);
        tree.leave.config.introduce = true;
        return tree;
    }

    // -------------------------------------------------------------------------

    visit (n : Node) : OpTree {
        switch (n.kind) {
        case NodeKind.SCOPE         : return this.emitScope(n as Scope);
        case NodeKind.CONST         : return this.emitConst(n);
        case NodeKind.BUILTIN       : return this.emitBuiltIn(n as BuiltIn);
        case NodeKind.BINARYOP      : return this.emitBinaryOp(n as BinaryOp);
        case NodeKind.FETCH         : return this.emitFetch(n);
        case NodeKind.STORE         : return this.emitStore(n);
        case NodeKind.DECLARE       : return this.emitDeclare(n);
        case NodeKind.LITERAL       : return this.emitLiteral(n);
        case NodeKind.ELEMFETCH     : return this.emitElemFetch(n as ArrayElemFetch);
        case NodeKind.ELEMSTORE     : return this.emitElemStore(n as ArrayElemStore);
        case NodeKind.SUBDEFINITION : return this.emitSubDefinition(n as SubDefinition);
        case NodeKind.SUBCALL       : return this.emitSubCall(n as SubCall);
        case NodeKind.CALLSUB       : return this.emitCallSub(n as CallSub);
        case NodeKind.SUBRETURN     : return this.emitSubReturn(n as SubReturn);
        case NodeKind.STATEMENT     : return this.emitStatement(n as Statement);
        case NodeKind.EXPRESSION    : return this.emitExpression(n as ExpressionNode);
        case NodeKind.CONDITIONAL   : return this.emitConditional(n as Conditional);
        case NodeKind.GLOBVAR       : return this.emitGlobVar(n as GlobVar);
        case NodeKind.GLOBFETCH     : return this.emitGlobFetch(n as GlobFetch);
        case NodeKind.GLOBSTORE     : return this.emitGlobStore(n as GlobStore);
        case NodeKind.GLOBDECLARE   : return this.emitGlobDeclare(n as GlobDeclare);
        default:
            throw new Error(`Unknown (or un-used) NodeKind (${JSON.stringify(n)})`)
        }
    }
}

