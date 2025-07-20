
import { logger } from '../src/Logger'

import {
    InstructionSet,
} from '../src/Runtime'

import {
    Program
} from '../src/AST'

import {
    OP, UNOP, LOGOP, MaybeOP, OpTree,
} from './Runtime'

import {
    loadInstructionSet,
} from './InstructionSet'


let id_seq = 1;
export function prettyPrinter (op : OP, depth : number) : void {
    logger.log(id_seq.toString().padStart(2, "0"), ":", "  ".repeat(depth), op.name, op.config)
    id_seq++;
}

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
        for (let k : any = op.first; k != undefined; k = k.sibling) {
            walkTraversalOrder(f, k, depth + 1);
        }
    }
}

export class Compiler {
    public opcodes : InstructionSet;

    constructor () {
        this.opcodes = loadInstructionSet();
    }

    compile (program : Program) : OpTree {
        let prog = program.emit();

        // link the opcodes ...
        walkTraversalOrder(
            (op, d) => {
                let opcode = this.opcodes.get(op.name);
                if (opcode == undefined) throw new Error(`Unable to find opcode(${op.name})`);
                //console.log("ADDING opcode to ", op.name);
                op.opcode = opcode;
            },
            prog.leave
        );

        return prog;
    }
}
