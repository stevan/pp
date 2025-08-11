
import { OpTree, OP, UNOP, LOGOP, MaybeOP } from '../Runtime/API'

import { prettyPrinter } from '../Tools'
import { walkTraversalOrder, walkExecOrder } from './OpTreeWalker'


export class CompilationUnit {

    constructor(
        public optree : OpTree
    ) {

        // FIXME - make it better ...
        let uid_seq = 0;
        walkTraversalOrder(
            (op, d) => { op.metadata.uid = ++uid_seq },
            optree.leave
        );
    }

    // TODO:
    // - find all definitions in the Optree
    //      - should we handle SymbolTree stuff here?
    //          - maybe just kind of declare it in some way
    // - how should this handle `use`-ed dependencies?
    //      - more metadata?

    prettyPrintExec () : void {
        walkExecOrder(prettyPrinter, this.optree.enter);
    }

    prettyPrintTree () : void {
        walkTraversalOrder(prettyPrinter, this.optree.leave);
    }
}

