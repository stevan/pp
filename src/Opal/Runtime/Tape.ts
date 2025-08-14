
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


export class Mix implements Tape {
    constructor(public optrees : OpTree[] = []) {}

    append (optree : OpTree) : void {
        this.optrees.push(optree);
    }

    async *run () : OpTreeStream {
        let index = 0;
        while (index < this.optrees.length) {
            let optree = this.optrees[index] as OpTree;
            yield optree;
            index++;
        }
    }
}
