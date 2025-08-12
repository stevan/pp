
import { Source, SourceStream, InputSource } from '../Types'

export class FromArray implements InputSource {
    public sources : Source[];

    constructor (srcs : Source[]) {
        this.sources = srcs;
    }

    async *run () : SourceStream {
        for (const source of this.sources) {
            yield source;
        }
    }
}

