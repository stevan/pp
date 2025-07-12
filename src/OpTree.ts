// -----------------------------------------------------------------------------

export type MaybeOP = OP | undefined

export class OP {
    public name    : string;
    public config  : any;
    public next    : MaybeOP; // exeuction order
    public sibling : MaybeOP; // tree order

    constructor (name : string, config : any) {
        this.name   = name;
        this.config = config;
    }
}

// statement seperators
export class COP extends OP {
    constructor() {
        super('nextstate', {})
    }
}

// unary operations
export class UNOP extends OP {
    public first : MaybeOP;
}

// binary operations
export class BINOP extends UNOP {
    public last : MaybeOP;
}

// logical operations (short circuit)
export class LOGOP extends UNOP {
    public other : MaybeOP;
}

// operations that take lists
export class LISTOP extends BINOP {
    public children : number = 0;
}

// -----------------------------------------------------------------------------

export class Pad {
    // TODO - figure out entries here ...
}

export class Optree {
    public root  : MaybeOP;
    public start : MaybeOP;
    public pad   : Pad = new Pad();
}

// -----------------------------------------------------------------------------

