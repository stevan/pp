
import { Source, SourceStream, InputSource } from '../Types'

export class FromString implements InputSource {
    public source : Source;

    constructor (src : Source) {
        this.source = src;
    }

    async *run () : SourceStream {
        yield this.source;
    }
}

