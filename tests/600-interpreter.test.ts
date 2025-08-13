
import { test } from "node:test"
import  assert  from "node:assert"

import {
    logger,
    prettyPrinter,
} from '../src/Opal/Tools'

import { walkExecOrder, walkTraversalOrder } from '../src/Opal/Compiler/OpTreeWalker'

import { InputSource, SourceStream } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'
import { Compiler } from '../src/Opal/Compiler'
import { Interpreter } from '../src/Opal/Interpreter'
import { CompilationUnit } from '../src/Opal/Compiler/CompilationUnit'

import * as AST from '../src/Opal/Parser/AST'

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


test('... testing compiler', async (t) => {

    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter();

    let source = new TestInput([`
        use Fact;

        say fact(10);
    `]);

    for await (const out of interpreter.run(
                            compiler.run(parser.run(source.run())))
                            )
    {
        console.log(out);
        //walkTraversalOrder(prettyPrinter, out.leave);
    }
});

