
import { test } from "node:test"
import  assert  from "node:assert"

import { InputSource, InputStream    } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'

import * as AST from '../src/Opal/Parser/AST'

export class TestInput implements InputSource {
    constructor(public source : string[]) {}

    async *run() : InputStream {
        let i = 0;
        while (i < this.source.length) {
            yield this.source[i] as string;
            i++;
        }
    }
}


test('... testing by-hand parser usage', async (t) => {

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
        assert.ok(ast instanceof AST.Program, '... it is an AST.Program');
    });
});

