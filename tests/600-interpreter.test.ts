
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
import { Linker } from '../src/Opal/Runtime/Linker'
import { Mix } from '../src/Opal/Runtime/Tape'

import {
    PRAGMA
} from '../src/Opal/Runtime/API'

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


test('... testing by-hand interpreter usage', async (t) => {

    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter();

    let fact_src = new TestInput([`

        sub fact ($n) {
            if ($n == 0) {
                return 1;
            } else {
                return $n * fact( $n - 1 );
            }
        }

    `]);

    let source = new TestInput([`
        use Fact;

        say fact(10);
    `]);

    parser.parse(source).then(async (ast) => {
        assert.ok(ast instanceof AST.Program, '... it is an AST.Program');
        //console.log('(main) AST', JSON.stringify(ast, null, 2));

        let optree = compiler.compile(ast);
        //console.log('(main) OpTree', optree);

        let pragmaAST = ast.pragmas[0] as AST.Pragma;
        //console.log('(main) Pragma', JSON.stringify(pragmaAST, null, 2));

        // make sure to remove it ...
        let pragmaOp = optree.pragmas.pop() as PRAGMA;
        //assert.ok(pragmaOp instanceof PRAGMA, '... it is a Pragma OP');
        //console.log('(main) PRAGMA', pragmaOp);

        let factOp = await pragmaOp.resolver(fact_src);
        //console.log('(main) Fact OpTree', factOp);

        //console.log('(main):');
        //console.log('EXEC:');
        //walkExecOrder(prettyPrinter, optree.enter);
        //console.log('TREE:');
        //walkTraversalOrder(prettyPrinter, optree.leave);

        //console.log('(main):');
        //console.log('EXEC:');
        //walkExecOrder(prettyPrinter, factOp.enter);
        //console.log('TREE:');
        //walkTraversalOrder(prettyPrinter, factOp.leave);

        let tape = new Mix([ factOp, optree ]);

        for await (const out of interpreter.play(tape)) {
            if (out.length != 0) {
                assert.ok((out[0] as string) == '3628800', '... got the expected result');
            }
        }

    });
});

