

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
/*
        %hash{ "hello" } = 10;
        %hash{ "hello" } = %hash { "hello" . "goodbye" };

        @array[0] = 100;
        @array[ 1 + 2, 3 ] = 10;

        @array[ %hash{"one"} ] = 10;
*/

    [
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash' } } },
          slice: {
            type: 'EXPRESSION',
            lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
            kind: ExpressionKind.CURLY,
            stack: [
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'hello' } } }
            ],
            opers: [], other : [], defer : [],
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10' } } }
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
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash' } } },
          slice: {
            type: 'EXPRESSION',
            lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
            kind: ExpressionKind.CURLY,
            stack: [
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'hello' } } }
            ],
            opers: [], other : [], defer : [],
          }
        },
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash' } } },
          slice: {
            type: 'EXPRESSION',
            lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
            kind: ExpressionKind.CURLY,
            stack: [
              {
                type: 'OPERATION',
                operator: { type: 'BINOP', token: { type: 'ATOM', source: '.' } },
                operands: [
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'hello' } } },
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'goodbye' } } }
                ]
              }
            ],
            opers: [], other : [], defer : [],
          }
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
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array' } } },
          slice: {
            type: 'EXPRESSION',
            lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '[' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ']' } } ],
            kind: ExpressionKind.SQUARE,
            stack: [
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0' } } }
            ],
            opers: [], other : [], defer : [],
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '100' } } }
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
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array' } } },
          slice: {
            type: 'EXPRESSION',
            lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '[' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ']' } } ],
            kind: ExpressionKind.SQUARE,
            stack: [
              {
                type: 'OPERATION',
                operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
                operands: [
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
                  { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
                ]
              },
              { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
            ],
            opers: [], other : [], defer : [],
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10' } } }
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
      operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
      operands: [
        {
          type: 'SLICE',
          value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array' } } },
          slice: {
            type: 'EXPRESSION',
            lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '[' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ']' } } ],
            kind: ExpressionKind.SQUARE,
            stack: [
              {
                type: 'SLICE',
                value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hash' } } },
                slice: {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
                  kind: ExpressionKind.CURLY,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'one' } } }
                  ],
                  opers: [], other : [], defer : [],
                }
              }
            ],
            opers: [], other : [], defer : [],
          }
        },
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10' } } }
      ]
    }
  ],
  opers: [], other : [], defer : [],
}
    ],
    { verbose : false, develop : false }
),
]);

