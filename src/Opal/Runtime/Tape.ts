
import { OpTreeStream } from '../Compiler'
import { OpTree } from '../Runtime/API'

export interface Tape {
    run () : OpTreeStream;
}

export class Single implements Tape {
    constructor(public optree : OpTree) {}

    async *run () : OpTreeStream {
        yield this.optree;
    }
}
