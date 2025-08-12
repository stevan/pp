
import * as readline from 'readline';
import * as fs       from 'fs';

import { Source, SourceStream, InputSource } from '../Types'

export class FromFile implements InputSource {
    public path : string;

    constructor (path : string) {
        this.path = path;
    }

    async *run () : SourceStream {
        yield new Promise<Source>((resolve) => {
            fs.readFile(this.path, 'utf8', (err, data) => {
                if (err) throw new Error(`Got error ${err}`);
                resolve(data);
            });
        })
    }
}


