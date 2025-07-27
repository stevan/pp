

import {
    ExpressionKind
} from '../src/Parser/TreeParser'

import {
    ParserTestRunner,
    ParserTestCase,

    MockLiteral,
    MockTerminator,
    MockStatement,
} from '../src/Tester/ParserTestRunner'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... binary expressions with parens',
    [`
        1 + 2;
        1 + 2 - 3;
        1 + (2 - 3);
        (1 + 2) - 3;
        (1 + 2) - (3 + 4);
        ((1 + 2) - ((3 * 4) / 5));
    `],
    [
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
      operands: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
      ]
    }
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
      operands: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '-' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
          ]
        }
      ]
    }
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
      operands: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '-' } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
              ]
            }
          ],
          opers: [], other : [], defer : [],
        }
      ]
    }
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '-' } },
      operands: [
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
              ]
            }
          ],
          opers: [], other : [], defer : [],
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
      ]
    }
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '-' } },
      operands: [
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
              ]
            }
          ],
          opers: [], other : [], defer : [],
        },
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
          kind: ExpressionKind.PARENS,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
              operands: [
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4' } } }
              ]
            }
          ],
          opers: [], other : [], defer : [],
        }
      ]
    }
  ],
  opers: [], other : [], defer : [],
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
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '-' } },
          operands: [
            {
              type: 'EXPRESSION',
              lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
              kind: ExpressionKind.PARENS,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
                  operands: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
                  ]
                }
              ],
              opers: [], other : [], defer : [],
            },
            {
              type: 'EXPRESSION',
              lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
              kind: ExpressionKind.PARENS,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '/' } },
                  operands: [
                    {
                      type: 'EXPRESSION',
                      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
                      kind: ExpressionKind.PARENS,
                      stack: [
                        {
                          type: 'OPERATION',
                          operator: { type: 'BINOP', token: { type: 'ATOM', source: '*' } },
                          operands: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } },
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4' } } }
                          ]
                        }
                      ],
                      opers: [], other : [], defer : [],
                    },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '5' } } }
                  ]
                }
              ],
              opers: [], other : [], defer : [],
            }
          ]
        }
      ],
      opers: [], other : [], defer : [],
    }
  ],
  opers: [], other : [], defer : [],
}
    ],
    { verbose : false, develop : false }
),
]);
