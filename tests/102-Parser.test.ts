

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
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
          ]
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
      ],
      opers: [], other : [],
    }
  ],
  opers: [], other : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
              ]
            }
          ],
          opers: [], other : [],
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
      ],
      opers: [], other : [],
    }
  ],
  opers: [], other : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
              ]
            }
          ],
          opers: [], other : [],
        },
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '*' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } },
            {
              type: 'EXPRESSION',
              lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
              kind: ExpressionKind.PARENS,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '-' } },
                  operands: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '5' } } }
                  ]
                }
              ],
              opers: [], other : [],
            }
          ]
        }
      ],
      opers: [], other : [],
    }
  ],
  opers: [], other : [],
}
    ],
    { verbose : false, develop : false }
),
]);
