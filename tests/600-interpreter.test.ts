
import { test } from "node:test"
import  assert  from "node:assert"

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

test('... testing interpreter', async (t) => {

    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter();

    let source   = new TestInput([`
        say "Hello World";
    `]);

    parser.parse(source).then((ast) => {
        console.log(JSON.stringify(ast, null, 2));
        assert.ok(ast instanceof AST.Program, '... it is an AST.Program');

        let unit = compiler.compile(ast);
        assert.ok(unit instanceof CompilationUnit, '... it is a compilation unit');
        //console.log('EXEC:');
        //unit.prettyPrintExec();
        //console.log('TREE:');
        //unit.prettyPrintTree();

        //interpreter.execute(unit);
    });
});

