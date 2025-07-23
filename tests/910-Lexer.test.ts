
import { test } from "node:test"
import  assert  from "node:assert"

import { logger } from '../src/Tools'

import { SourceStream, Tokenizer } from '../src/Parser/Tokenizer'
import { Lexer                   } from '../src/Parser/Lexer'

let source = SourceStream([
`

sub gcd ($a, $b) {
    if ($b == 0) {
        return $a
    } else {
        return gcd($b, $a % $b)
    }
}

`
]);


let tokenizer = new Tokenizer();
let lexer     = new Lexer();

for (const got of lexer.run(tokenizer.run(source))) {
    logger.log(got);
}
