
import { OpTree, OP, UNOP, LOGOP, MaybeOP } from '../Runtime/API'

export function walkExecOrder(f : (o : OP, d : number) => void, op : OP, depth : number = 0) {
    while (op != undefined) {
        f(op, depth);

        if (op.name == 'goto' && depth > 0) return;

        if (op instanceof LOGOP && op.other) {
            walkExecOrder(f, op.other, depth + 1);
        }

        if (op.next == undefined) return;
        op = op.next;
    }
}

export function walkTraversalOrder(f : (o : OP, d : number) => void, op : OP, depth : number = 0) {
    f(op, depth);
    if (op instanceof UNOP) {
        for (let k : MaybeOP = op.first; k != undefined; k = k.sibling) {
            walkTraversalOrder(f, k, depth + 1);
        }
    }
}
