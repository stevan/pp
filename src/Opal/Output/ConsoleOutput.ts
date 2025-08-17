
import { OutputStream, OutputSink } from '../Types';

export class ConsoleOutput implements OutputSink {
    constructor(
        public prefix  : string = '',
        public postfix : string = '') {}

    async run (source: OutputStream) : Promise<void> {
        for await (const result of source) {
            console.log(this.prefix, ...result, this.postfix);
        }
    }
}
