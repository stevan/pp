
import { test } from "node:test"
import  assert  from "node:assert"

import { logger, SourceStream } from '../src/Tools'

import {
    ParserTestRunner,
    ParserTestCase
} from '../src/Tester/ParserTestRunner'

let runner = new ParserTestRunner();

runner.run([
    new ParserTestCase('... simple number literal',
        [`1;`],
        [
            {
                type: 'STATEMENT',
                body: {
                    type: 'EXPRESSION',
                    parens: false,
                    body: [
                        { type: 'TERM', body: { type: 'LITERAL',  token: { type: 'NUMBER', source: '1', seq_id: 1 } } },
                    ]
                }
            }
        ],
    ),
    new ParserTestCase('... simple addition of 2 number literals',
        [`1 + 2;`],
        [
            {
                type: 'STATEMENT',
                body: {
                    type: 'EXPRESSION',
                    parens: false,
                    body: [
                        { type: 'TERM', body: { type: 'LITERAL',  token: { type: 'NUMBER', source: '1', seq_id: 1 } } },
                        { type: 'TERM', body: { type: 'OPERATOR', token: { type: 'ATOM',   source: '+', seq_id: 2 } } },
                        { type: 'TERM', body: { type: 'LITERAL',  token: { type: 'NUMBER', source: '2', seq_id: 3 } } }
                    ]
                }
            }
        ],
    ),
    new ParserTestCase('... simple addition of number literals assigned to a variable',
        [`my $x = 1 + 2;`],
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
    new ParserTestCase('... simple assignment of two variables',
        [`my $x = 1; my $y = 1;`],
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
