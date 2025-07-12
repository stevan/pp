
import { logger } from './Logger'
import {
    SV,
    Stash, newStash,
    newIV, assertIsIV
} from './SymbolTable'

import {
    OP, MaybeOP
} from './OpTree'

export type Opcode = (i : Interpreter, op : OP) => MaybeOP;

export class Interpreter {
    public stack   : SV[];
    public pad     : Map<string, SV>;
    public root    : Stash;
    public opcodes : Map<string, Opcode>;

    constructor () {
        this.stack = [];
        this.pad   = new Map<string, SV>();
        this.root  = newStash('main::');

        this.opcodes = new Map<string, Opcode>();

        this.opcodes.set('enter', (i, op) => op.next);
        this.opcodes.set('leave', (i, op) => op.next);

        this.opcodes.set('nextstate', (i, op) => op.next);

        this.opcodes.set('const', (i, op) => {
            i.stack.push(newIV(op.config.literal));
            return op.next;
        });

        this.opcodes.set('padsv_store', (i, op) => {
            i.pad.set(op.config.target, i.stack.pop() as SV);
            return op.next
        });
        this.opcodes.set('padsv_fetch', (i, op) => {
            let t = i.pad.get(op.config.target);
            if (t == undefined) throw new Error(`The pad var(${op.config.target}) does not exist`);
            i.stack.push(t as SV);
            return op.next
        });

        this.opcodes.set('add', (i, op) => {
            let lhs = i.stack.pop() as SV;
            let rhs = i.stack.pop() as SV;
            assertIsIV(lhs);
            assertIsIV(rhs);
            i.stack.push(newIV( lhs.value + rhs.value ));
            return op.next;
        });
    }

    run (root : OP) : void {
        let op : MaybeOP = root;
        while (op != undefined) {
            let opcode = this.opcodes.get(op.name);
            if (opcode == undefined) throw new Error(`Could not find opcode(${op.name})`);
            logger.group(`*OPCODE[${op.name}] = ${JSON.stringify(op.config)}`);
            op = opcode(this, op);
            logger.log('STACK :', this.stack);
            logger.log('PAD   :', this.pad);
            logger.groupEnd();
        }
    }
}
