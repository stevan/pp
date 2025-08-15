
import { test } from "node:test"
import  assert  from "node:assert"

import { InputSource, SourceStream } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'
import { Compiler } from '../src/Opal/Compiler'
import { OpTree } from '../src/Opal/Runtime/API'

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

    let parser   = new Parser();
    let compiler = new Compiler();

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
        //console.log(JSON.stringify(ast, null, 2));
        assert.ok(ast instanceof AST.Program, '... it is an AST.Program');

        let pragma  = ast.pragmas[0] as AST.Pragma;
        let resolve = pragma.resolver as AST.ASTResolver;
        let FactAST = await resolve(fact_src);
        //console.log(JSON.stringify(FactAST, null, 2));
        assert.ok(FactAST instanceof AST.Program, '... FactAST is an AST.Program');

        let unit = compiler.compile(ast);
        assert.ok(unit instanceof OpTree, '... it is an optree');

        let FactUnit = compiler.compile(FactAST);
        assert.ok(FactUnit instanceof OpTree, '... FactUnit is an OpTree');

        //console.log('Fact:');
        //console.log('EXEC:');
        //FactUnit.prettyPrintExec();
        //console.log('TREE:');
        //FactUnit.prettyPrintTree();

        //console.log('(main):');
        //console.log('EXEC:');
        //unit.prettyPrintExec();
        //console.log('TREE:');
        //unit.prettyPrintTree();
    });
});

