
import { Input, InputStream, InputSource } from '../Types'

export class FromArray implements InputSource {
    public sources : Input[];

    constructor (srcs : Input[]) {
        this.sources = srcs;
    }

    async *run () : InputStream {
        for (const source of this.sources) {
            yield source;
        }
    }
}

