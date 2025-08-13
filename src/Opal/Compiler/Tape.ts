
import { OpTreeStream } from '../Compiler'
import { OpTree } from '../Runtime/API'

export class Tape {
    constructor(public optree : OpTree) {}

    async *run () : OpTreeStream {
        yield this.optree;
    }
}
