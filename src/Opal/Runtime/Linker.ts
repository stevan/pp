
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

        // add the linker to the Pragma resolvers
        for (const pragma of optree.pragmas) {
            let unlinked = pragma.resolver;
            pragma.resolver = (src) => unlinked(src).then((ot) => this.linkOpTree(ot));
        }

        // link the OPs and Opcodes together
        walkTraversalOrder(
            (op, d) => {
                let opcode = this.opcodes.get(op.name);
                if (opcode == undefined) throw new Error(`Unable to find opcode(${op.name})`);
                op.metadata.compiler.opcode = opcode;
            },
            optree.leave
        );

        return optree;
    }

}
