
import { test } from "node:test"
import  assert  from "node:assert"

import { InputSource, SourceStream    } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'

export class TestInput implements InputSource {
    constructor(public source : string[]) {}

    async *run() : SourceStream {
        let i = 0;
        while (i < this.source.length) {
            yield this.source[i] as string;
            i++;
        }
    }
}


test('... testing', async (t) => {

    let parser = new Parser();
    let source = new TestInput([`

        sub fact ($n) {
            if ($n == 0) {
                return 1;
            } else {
                return $n * fact( $n - 1 );
            }
        }

        say fact(10);

    `]);

    parser.parse(source).then((ast) => {
        console.log(JSON.stringify(ast, null, 2));
    });


});

