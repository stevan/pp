
import { SyncOutputStream, OutputStream, OutputSink, Output } from '../Types';

export class ConsoleOutput implements OutputSink {
    constructor(
        public prefix  : string = '',
        public postfix : string = '') {}

    async run (source: OutputStream) : Promise<void> {
        for await (const result of source) {
            console.log(this.prefix, ...result, this.postfix);
        }
    }

    async *syncronize (source: SyncOutputStream) : AsyncGenerator<void, void, void> {
        for (const result of source) {
            console.log(this.prefix, ...result, this.postfix);
            yield new Promise<void>((r) => r());
        }
    }

    async sync (source: SyncOutputStream) : Promise<void> {
        for await (const nil of this.syncronize(source)) {}
    }
}
