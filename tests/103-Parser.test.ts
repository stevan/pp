

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
new ParserTestCase('... hash/array slices',
    [`
        %hash{ "hello" } = 10;
        %hash{ "hello" } = %hash { "hello" . "goodbye" };

        @array[0] = 100;
        @array[ 1 + 2, 3 ] = 10;

        @array[ %hash{"one"} ] = 10;
    `],
    [
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=', seq_id: 5 } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash', seq_id: 1 } } },
          slice: {
            type: 'EXPRESSION',
            kind: ExpressionKind.CURLY,
            stack: [
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'hello', seq_id: 3 } } }
            ],
            opers: []
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10', seq_id: 6 } } }
      ]
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
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=', seq_id: 12 } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash', seq_id: 8 } } },
          slice: {
            type: 'EXPRESSION',
            kind: ExpressionKind.CURLY,
            stack: [
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'hello', seq_id: 10 } } }
            ],
            opers: []
          }
        },
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash', seq_id: 13 } } },
          slice: {
            type: 'EXPRESSION',
            kind: ExpressionKind.CURLY,
            stack: [
              {
                type: 'OPERATION',
                operator: { type: 'BINOP', token: { type: 'ATOM', source: '.', seq_id: 16 } },
                operands: [
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'hello', seq_id: 15 } } },
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'goodbye', seq_id: 17 } } }
                ]
              }
            ],
            opers: []
          }
        }
      ]
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
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=', seq_id: 24 } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array', seq_id: 20 } } },
          slice: {
            type: 'EXPRESSION',
            kind: ExpressionKind.SQUARE,
            stack: [
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0', seq_id: 22 } } }
            ],
            opers: []
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '100', seq_id: 25 } } }
      ]
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
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=', seq_id: 35 } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array', seq_id: 27 } } },
          slice: {
            type: 'EXPRESSION',
            kind: ExpressionKind.SQUARE,
            stack: [
              {
                type: 'OPERATION',
                operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 30 } },
                operands: [
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 29 } } },
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 31 } } }
                ]
              },
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 33 } } }
            ],
            opers: []
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10', seq_id: 36 } } }
      ]
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
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=', seq_id: 45 } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array', seq_id: 38 } } },
          slice: {
            type: 'EXPRESSION',
            kind: ExpressionKind.SQUARE,
            stack: [
              {
                type: 'SLICE',
                value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash', seq_id: 40 } } },
                slice: {
                  type: 'EXPRESSION',
                  kind: ExpressionKind.CURLY,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'one', seq_id: 42 } } }
                  ],
                  opers: []
                }
              }
            ],
            opers: []
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10', seq_id: 46 } } }
      ]
    }
  ],
  opers: []
}
    ],
    { verbose : false, develop : false }
),
]);

