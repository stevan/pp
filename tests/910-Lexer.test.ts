
import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Logger'

import { SourceStream, Tokenizer } from '../src/Parser/Tokenizer'
import { Lexer                   } from '../src/Parser/Lexer'

let source = SourceStream([
`

my @foo = (1, 2, 3);
@foo[0] = @foo[2];
@foo[ @foo[1] ] = @foo[2] - 1;
@foo[ @foo[1] - 1 ] = 1;

`
]);


let tokenizer = new Tokenizer();
let lexer     = new Lexer();

for (const got of lexer.run(tokenizer.run(source))) {
    logger.log(got);
}
