

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
new ParserTestCase('... conditional statements',
    [`
        if (0 == 0) { 1 } else { 3 }
        if (true) { false }
        if (0 == 0) { 11000 } else { 30 }
        unless (false) { true }
    `],
    [
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'if' } } ],
  kind: ExpressionKind.CONTROL,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '==' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0' } } }
          ]
        }
      ],
      opers: []
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } }
      ],
      opers: []
    },
  ],
  opers: []
},
{
  type: 'EXPRESSION',
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'else' } } ],
  kind: ExpressionKind.CONTROL,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
      ],
      opers: []
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'if' } } ],
  kind: ExpressionKind.CONTROL,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'ATOM', source: 'true' } } }
      ],
      opers: []
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'ATOM', source: 'false' } } }
      ],
      opers: []
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'if' } } ],
  kind: ExpressionKind.CONTROL,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '==' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0' } } }
          ]
        }
      ],
      opers: []
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '11000' } } }
      ],
      opers: []
    },
  ],
  opers: []
},
{
  type: 'EXPRESSION',
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'else' } } ],
  kind: ExpressionKind.CONTROL,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '30' } } }
      ],
      opers: []
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'unless' } } ],
  kind: ExpressionKind.CONTROL,
  stack: [
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '(' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ')' } } ],
      kind: ExpressionKind.PARENS,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'ATOM', source: 'false' } } }
      ],
      opers: []
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'ATOM', source: 'true' } } }
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

/*

*/
