
import { test } from "node:test"
import  assert  from "node:assert"

import {
    logger,
    prettyPrinter,
} from '../src/Opal/Tools'

import { walkExecOrder, walkTraversalOrder } from '../src/Opal/Compiler/OpTreeWalker'

import { InputSource, InputStream } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'
import { Compiler } from '../src/Opal/Compiler'
import { Interpreter } from '../src/Opal/Interpreter'
import { Linker } from '../src/Opal/Runtime/Linker'
import { Single } from '../src/Opal/Runtime/Tape'

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

test('... testing standard input, needs to be tested by hand', async (t) => {

    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter();

    let source = new TestInput([`
        say 'What is your name?';
        my $x = readline;
        say 'Your name is: ' . $x;
    `]);

    parser.parse(source).then(async (ast) => {
        assert.ok(ast instanceof AST.Program, '... it is an AST.Program');
        //console.log('(main) AST', JSON.stringify(ast, null, 2));

        let optree = compiler.compile(ast);
        //console.log('(main) OpTree', optree);

        //console.log('(main):');
        //console.log('EXEC:');
        //walkExecOrder(prettyPrinter, optree.enter);
        //console.log('TREE:');
        //walkTraversalOrder(prettyPrinter, optree.leave);

        //for await (const out of interpreter.play(new Single(optree))) {
        //    console.log('GOT', out);
        //}

    });
});


