

import {
    ExpressionKind
} from '../src/Parser/TreeParser'

import {
    ParserTestRunner,
    ParserTestCase,
} from '../src/Tester/ParserTestRunner'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... list expressions',
    [`
        (1, 2 + 2, 3);
        (1, (2 + 2), 3);
        (1, (2 + 2), 3 * (4 - 5));
    `],
    [
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'EXPRESSION',
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 2 } } },
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 5 } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 4 } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 6 } } }
          ]
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 8 } } }
      ],
      opers: []
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'EXPRESSION',
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 12 } } },
        {
          type: 'EXPRESSION',
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 16 } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 15 } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 17 } } }
              ]
            }
          ],
          opers: []
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 20 } } }
      ],
      opers: []
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'EXPRESSION',
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 24 } } },
        {
          type: 'EXPRESSION',
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 28 } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 27 } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 29 } } }
              ]
            }
          ],
          opers: []
        },
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '*', seq_id: 33 } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 32 } } },
            {
              type: 'EXPRESSION',
              kind: ExpressionKind.PARENS,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '-', seq_id: 36 } },
                  operands: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4', seq_id: 35 } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '5', seq_id: 37 } } }
                  ]
                }
              ],
              opers: []
            }
          ]
        }
      ],
      opers: []
    }
  ],
  opers: []
}
    ],
    { verbose : false, develop : false }
),
]);
