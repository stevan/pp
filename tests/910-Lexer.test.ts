
import { test } from "node:test"
import  assert  from "node:assert"

import { logger, SourceStream } from '../src/Tools'

import { Tokenizer  } from '../src/Parser/Tokenizer'
import { Lexer      } from '../src/Parser/Lexer'
import { TreeParser } from '../src/Parser/TreeParser'

let source = SourceStream([
`
my $x = 1;
my $y = 2;
foreach my $x (@foo) {
    say $x;
    say $y;
}
`
]);


let tokenizer = new Tokenizer();
let lexer     = new Lexer();
let parser    = new TreeParser();

for (const got of parser.run(lexer.run(tokenizer.run(source)))) {
    logger.log(got);
}
