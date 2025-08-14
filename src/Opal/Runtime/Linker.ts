
import { InstructionSet, loadInstructionSet } from './InstructionSet'
import { OpTree, OP, MaybeOP, PRAGMA } from './API'
import { walkTraversalOrder } from '../Compiler/OpTreeWalker'
import { OpTreeStream } from '../Compiler'

// -----------------------------------------------------------------------------

export class Linker {
    public opcodes : InstructionSet;

    constructor () {
        this.opcodes = loadInstructionSet();
    }

    async *link (source : OpTreeStream) : OpTreeStream {
        for await (const optree of source) {
            yield this.linkOpTree(optree);
        }
    }

    linkOpTree (optree : OpTree) : OpTree {
        let uid_seq = 0;

        // link the OPs and Opcodes
        walkTraversalOrder(
            (op, d) => {
                let opcode = this.opcodes.get(op.name);
                if (opcode == undefined) throw new Error(`Unable to find opcode(${op.name})`);
                op.metadata.uid             = ++uid_seq;
                op.metadata.compiler.opcode = opcode;
                if (op instanceof PRAGMA) {
                    let unlinked = op.resolver;
                    op.resolver = (src) => unlinked(src).then((ot) => this.linkOpTree(ot));
                    optree.pragmas.push(op);
                }
            },
            optree.leave
        );

        return optree;
    }

}
