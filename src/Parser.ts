
import {
    OP, MaybeOP, NOOP, COP, BINOP, UNOP
} from './OpTree'

export interface Node {
    deparse () : string;
    emit    () : OP;
}

export class Program implements Node {
    constructor(public statements : Statement[]) { }

    deparse() : string {
        return this.statements.map((s) => s.deparse()).join('\n');
    }

    emit () : OP {
        let enter = new OP('enter', {});
        let leave = new UNOP('leave', { halt : true });

        let curr = enter;
        for (const statement of this.statements) {
            let start = statement.emit();
            curr.next = start;

            let end = start;
            while (end.next != undefined) {
                end = end.next;
            }

            curr = end;
        }

        curr.next = leave;

        return enter;
    }
}

export class Statement implements Node {
    constructor(public body : Node) {}

    deparse() : string { return this.body.deparse() + ';' }

    emit () : OP {
        let s = new COP();
        s.next = this.body.emit();
        return s;
    }
}

export class ConstInt implements Node {
    constructor(public literal : number) {}

    deparse() : string { return String(this.literal) }

    emit () : OP {
        return new OP('const', { literal : this.literal })
    }
}

export class ScalarVar implements Node {
    constructor(public name : string) {}

    deparse() : string { return '$' + this.name }

    emit () : OP {
        return new UNOP('padsv_fetch', {
            target : this.name
        });
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

    emit () : OP {
        let value = this.value.emit();
        let variable = new UNOP('padsv_store', {
            target : this.ident.name
        });
        value.next = variable;
        return value;
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

    emit () : OP {
        let lhs = this.lhs.emit();
        let rhs = this.rhs.emit();
        let op  = new BINOP('add', { operation : '+' });
        lhs.next = rhs;
        rhs.next = op;
        return lhs;
    }
}
