
export interface Node {
    deparse() : string;
}

export class Program implements Node {
    constructor(public statements : Statement[]) { }

    deparse() : string {
        return this.statements.map((s) => s.deparse()).join('\n');
    }
}

export class Statement implements Node {
    constructor(public body : Node) {}

    deparse() : string { return this.body.deparse() + ';' }
}

export class ConstInt implements Node {
    constructor(public literal : number) {}

    deparse() : string { return String(this.literal) }
}

export class ScalarVar implements Node {
    constructor(public name : string) {}

    deparse() : string { return '$' + this.name }
}

export class ScalarDecl implements Node {
    constructor(
        public ident : ScalarVar,
        public value : Node,
    ) {}

    deparse() : string {
        return `my ${this.ident.deparse()} = ${this.value.deparse()}`
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
}
