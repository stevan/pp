
import { Input, InputStream, InputSource } from '../Types'

export class FromString implements InputSource {
    public source : Input;

    constructor (src : Input) {
        this.source = src;
    }

    async *run () : InputStream {
        yield this.source;
    }
}

