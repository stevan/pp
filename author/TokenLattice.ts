// -----------------------------------------------------------------------------

export type Unknown  = { type: 'UNKNOWN' }
export type Known    = { type: 'KNOWN', value: Token }
export type Conflict = { type: 'CONFLICT', values: [ Token, Token ] }

export type Perhaps  = Unknown | Known | Conflict

// Type guards
export function isUnknown   (s: Perhaps): s is Unknown  { return s.type === 'UNKNOWN' }
export function isKnown     (s: Perhaps): s is Known    { return s.type === 'KNOWN' }
export function isConflict  (s: Perhaps): s is Conflict { return s.type === 'CONFLICT' }

// Constructors

export function Unknown () : Perhaps {
    return { type: 'UNKNOWN' }
}

export function Known (token: Token) : Perhaps {
    return { type: 'KNOWN', value: t }
}

export function Conflict (a: Token, b: Token) : Perhaps {
    return { type: 'CONFLICT', values : [ a, b ] }
}

// -----------------------------------------------------------------------------

export abstract class Lattice {
    public version : number = 1;

    isUnknown  () : boolean;
    isKnown    () : boolean;
    isConflict () : boolean;

    merge (possibility: Perhaps) : boolean {}

    join (a : Perhaps, b : Perhaps) : Perhaps {
        if (isConflict(a) || isConflict(b)) return isConflict(a) ? a : b;
        if (isUnknown(a)) return b;
        if (isUnknown(b)) return a;
        if (isKnown(a) && isKnown(b)) {
            if (a.value === b.value) return a;
            return Conflict(a.value, b.value);
        }
        throw new Error("Invalid lattice elements");
    }

    equals (a : Perhaps, b : Perhaps) : boolean {
        if (isConflict(a) && isConflict(b)) {
            // Order of values doesn't matter for equality
            return (a.values[0] === b.values[0] && a.values[1] === b.values[1]) ||
                   (a.values[0] === b.values[1] && a.values[1] === b.values[0]);
        }
        if (isUnknown(a) && isUnknown(b)) return true;
        if (isKnown(a)   && isKnown(b))   return a.value === b.value;
        return false;
    }
}


// -----------------------------------------------------------------------------

export class TermLattice extends Lattice {
    constructor(public term : Perhaps) {}

    isUnknown  () : boolean { return   isUnknown(this.term) }
    isKnown    () : boolean { return     isKnown(this.term) }
    isConflict () : boolean { return  isConflict(this.term) }

    merge (possibility: Perhaps) : boolean {
        const result = this.join(this.term, possibility);
        if (!this.equals(result, this.term)) {
            this.term = result;
            this.version++;
        }
        return this.isConflict();
    }
}

// -----------------------------------------------------------------------------

export class UnaryOpLattice {
    public operator : Perhaps;
    public operand  : Perhaps;

    constructor(operator : Perhaps) {
        this.operator = Unknown();
        this.operand  = Unknown();
    }

    isUnknown  () : boolean { return   isUnknown(this.operator) ||  isUnknown(this.operand) }
    isKnown    () : boolean { return     isKnown(this.operator) &&    isKnown(this.operand) }
    isConflict () : boolean { return  isConflict(this.operator) || isConflict(this.operand) }

    mergeOperator (possibility: Perhaps) : void {
        const result = this.join(this.operator, possibility);
        if (!this.equals(result, this.operator)) {
            this.operator = result;
            this.version++;
        }
    }

    mergeOperand (possibility: Perhaps) : void {
        const result = this.join(this.operand, possibility);
        if (!this.equals(result, this.operand)) {
            this.operator = result;
            this.version++;
        }
    }

    merge (possibility: Perhaps) : boolean {
        if (isUnknown(this.operator)) {
            this.mergeOperator(possibility);
        } else {
            this.mergeOperand(possibility);
        }
        return this.inConflict();
    }
}
