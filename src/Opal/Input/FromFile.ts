
import * as readline from 'readline';
import * as fs       from 'fs';

import { Input, InputStream, InputSource } from '../Types'

export class FromFile implements InputSource {
    public path : string;

    constructor (path : string) {
        this.path = path;
    }

    async *run () : InputStream {
        yield new Promise<Input>((resolve) => {
            fs.readFile(this.path, 'utf8', (err, data) => {
                if (err) throw new Error(`Got error ${err}`);
                //console.log("GOT DATA", data);
                resolve(data);
            });
        })
    }
}


