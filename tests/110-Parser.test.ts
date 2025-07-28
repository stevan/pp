

import {
    ParseTree,
    ExpressionKind
} from '../src/Parser/TreeParser'

import {
    ParserTestRunner,
    ParserTestCase,
} from '../src/Tester/ParserTestRunner'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... nested control structures',
    [`

say join ', ', 1, 2, 3;


    `],
    [
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
      operands: [
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } } ],
          kind: ExpressionKind.LIST,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'join' } },
              operands: [
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'join' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.LIST,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: ', ' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
                  ],
                  other: [],
                  opers: [],
                  defer: []
                }
              ]
            }
          ],
          other: [],
          opers: [],
          defer: []
        }
      ]
    }
  ],
  other: [],
  opers: [],
  defer: []
}
    ],
    {
        verbose : false,
        develop : false,
        pretty_print : false,
    }
),
]);
