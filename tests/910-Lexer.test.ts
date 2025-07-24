
import { test } from "node:test"
import  assert  from "node:assert"

import { logger, SourceStream } from '../src/Tools'

import {
    ParserTestRunner,
    ParserTestCase
} from '../src/Tester/ParserTestRunner'

let runner = new ParserTestRunner();

runner.run([
    new ParserTestCase(
        [`1 + 2;`],
        [
            { type : 'NUMBER',  source : '1', seq_id : 1 },
            { type : 'ATOM',    source : '+', seq_id : 2 },
            { type : 'NUMBER',  source : '2', seq_id : 3 },
            { type : 'DIVIDER', source : ';', seq_id : 4 },
        ],
        [
            { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1', seq_id : 1 } },
            { type : 'OPERATOR',   token : { type : 'ATOM',    source : '+', seq_id : 2 } },
            { type : 'LITERAL',    token : { type : 'NUMBER',  source : '2', seq_id : 3 } },
            { type : 'TERMINATOR', token : { type : 'DIVIDER', source : ';', seq_id : 4 } },
        ],
        [
            {
              type: 'STATEMENT',
              body: {
                type: 'EXPRESSION',
                    parens: false,
                    body: [
                        { type: 'TERM', body: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 1 } } },
                        { type: 'TERM', body: { type: 'OPERATOR', token: { type: 'ATOM', source: '+', seq_id: 2 } } },
                        { type: 'TERM', body: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 3 } } }
                    ]
                }
            }
        ],
    ),
    new ParserTestCase(
        [`my $x = 1 + 2;`],
        [
            { type : 'ATOM',    source : 'my', seq_id : 1 },
            { type : 'ATOM',    source : '$x', seq_id : 2 },
            { type : 'ATOM',    source : '=',  seq_id : 3 },
            { type : 'NUMBER',  source : '1',  seq_id : 4 },
            { type : 'ATOM',    source : '+',  seq_id : 5 },
            { type : 'NUMBER',  source : '2',  seq_id : 6 },
            { type : 'DIVIDER', source : ';',  seq_id : 7 },
        ],
        [
            { type : 'KEYWORD',    token : { type : 'ATOM',    source : 'my', seq_id : 1 }},
            { type : 'IDENTIFIER', token : { type : 'ATOM',    source : '$x', seq_id : 2 }},
            { type : 'OPERATOR',   token : { type : 'ATOM',    source : '=',  seq_id : 3 }},
            { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1',  seq_id : 4 }},
            { type : 'OPERATOR',   token : { type : 'ATOM',    source : '+',  seq_id : 5 }},
            { type : 'LITERAL',    token : { type : 'NUMBER',  source : '2',  seq_id : 6 }},
            { type : 'TERMINATOR', token : { type : 'DIVIDER', source : ';',  seq_id : 7 }},
        ],
        [
            {
              type: 'STATEMENT',
              body: {
                type: 'EXPRESSION',
                    parens: false,
                    body: [
                        { type : 'TERM', body : { type : 'KEYWORD',    token : { type : 'ATOM',    source : 'my', seq_id : 1 }}},
                        { type : 'TERM', body : { type : 'IDENTIFIER', token : { type : 'ATOM',    source : '$x', seq_id : 2 }}},
                        { type : 'TERM', body : { type : 'OPERATOR',   token : { type : 'ATOM',    source : '=',  seq_id : 3 }}},
                        { type : 'TERM', body : { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1',  seq_id : 4 }}},
                        { type : 'TERM', body : { type : 'OPERATOR',   token : { type : 'ATOM',    source : '+',  seq_id : 5 }}},
                        { type : 'TERM', body : { type : 'LITERAL',    token : { type : 'NUMBER',  source : '2',  seq_id : 6 }}},
                    ],
                }
            }
        ],
    ),
    new ParserTestCase(
        [`my $x = 1;`,`my $y = 1;`],
        [
            { type : 'ATOM',    source : 'my', seq_id : 1 },
            { type : 'ATOM',    source : '$x', seq_id : 2 },
            { type : 'ATOM',    source : '=',  seq_id : 3 },
            { type : 'NUMBER',  source : '1',  seq_id : 4 },
            { type : 'DIVIDER', source : ';',  seq_id : 5 },
            { type : 'ATOM',    source : 'my', seq_id : 6 },
            { type : 'ATOM',    source : '$y', seq_id : 7 },
            { type : 'ATOM',    source : '=',  seq_id : 8 },
            { type : 'NUMBER',  source : '1',  seq_id : 9 },
            { type : 'DIVIDER', source : ';',  seq_id : 10 },
        ],
        [
            { type : 'KEYWORD',    token : { type : 'ATOM',    source : 'my', seq_id : 1 }},
            { type : 'IDENTIFIER', token : { type : 'ATOM',    source : '$x', seq_id : 2 }},
            { type : 'OPERATOR',   token : { type : 'ATOM',    source : '=',  seq_id : 3 }},
            { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1',  seq_id : 4 }},
            { type : 'TERMINATOR', token : { type : 'DIVIDER', source : ';',  seq_id : 5 }},
            { type : 'KEYWORD',    token : { type : 'ATOM',    source : 'my', seq_id : 6 }},
            { type : 'IDENTIFIER', token : { type : 'ATOM',    source : '$y', seq_id : 7 }},
            { type : 'OPERATOR',   token : { type : 'ATOM',    source : '=',  seq_id : 8 }},
            { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1',  seq_id : 9 }},
            { type : 'TERMINATOR', token : { type : 'DIVIDER', source : ';',  seq_id : 10 }},
        ],
        [
            {
              type: 'STATEMENT',
              body: {
                type: 'EXPRESSION',
                    parens: false,
                    body: [
                        { type : 'TERM', body : { type : 'KEYWORD',    token : { type : 'ATOM',    source : 'my', seq_id : 1 }}},
                        { type : 'TERM', body : { type : 'IDENTIFIER', token : { type : 'ATOM',    source : '$x', seq_id : 2 }}},
                        { type : 'TERM', body : { type : 'OPERATOR',   token : { type : 'ATOM',    source : '=',  seq_id : 3 }}},
                        { type : 'TERM', body : { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1',  seq_id : 4 }}},
                    ]
                }
            },
            {
              type: 'STATEMENT',
              body: {
                type: 'EXPRESSION',
                    parens: false,
                    body: [
                        { type : 'TERM', body : { type : 'KEYWORD',    token : { type : 'ATOM',    source : 'my', seq_id : 6 }}},
                        { type : 'TERM', body : { type : 'IDENTIFIER', token : { type : 'ATOM',    source : '$y', seq_id : 7 }}},
                        { type : 'TERM', body : { type : 'OPERATOR',   token : { type : 'ATOM',    source : '=',  seq_id : 8 }}},
                        { type : 'TERM', body : { type : 'LITERAL',    token : { type : 'NUMBER',  source : '1',  seq_id : 9 }}},
                    ]
                }
            }
        ],
    )
]);
