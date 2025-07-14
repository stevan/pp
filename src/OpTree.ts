
import {
    SV,
} from './SymbolTable'

// -----------------------------------------------------------------------------

export type MaybeOP = OP | undefined

// -----------------------------------------------------------------------------

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

export class NOOP extends OP {
    constructor() {
        super('null', {})
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

export class OpTree {
    public enter : OP;
    public leave : OP;

    constructor(enter : OP, leave : OP) {
        this.enter = enter;
        this.leave = leave;
    }
}

// -----------------------------------------------------------------------------

