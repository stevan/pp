

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
      defer: [], opers: [], other : [],
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } }
      ],
      defer: [], opers: [], other : [],
    },
  ],
  opers: [],
  defer: [],
  other : [
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
          defer: [], opers: [], other : [],
        }
      ],
      defer: [], opers: [], other : [],
    }
  ],
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
      defer: [], opers: [], other : [],
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'ATOM', source: 'false' } } }
      ],
      defer: [], opers: [], other : [],
    }
  ],
  defer: [], opers: [], other : [],
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
      defer: [], opers: [], other : [],
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '11000' } } }
      ],
      defer: [], opers: [], other : [],
    },
  ],
  opers: [],
  defer: [],
  other : [
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
          defer: [], opers: [], other : [],
        }
      ],
      defer: [], opers: [], other : [],
    },
  ],
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
      defer: [], opers: [], other : [],
    },
    {
      type: 'EXPRESSION',
      lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '{' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: '}' } } ],
      kind: ExpressionKind.CURLY,
      stack: [
        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'ATOM', source: 'true' } } }
      ],
      defer: [], opers: [], other : [],
    }
  ],
  defer: [], opers: [], other : [],
}
    ],
    { verbose : false, develop : false }
),
]);

/*

*/
