

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
new ParserTestCase('... qualified identifiers',
    [`
        $Hello::World;
        Hello::World;
        @Hello::World[0];
        *Hello::World;
    `],
    [
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$Hello::World' } } },
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'BAREWORD', token: { type: 'ATOM', source: 'Hello::World' } } },
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    {
      type: 'SLICE',
      value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@Hello::World' } } },
      slice: {
        type: 'EXPRESSION',
        kind: ExpressionKind.SQUARE,
        lexed: [ { type: 'OPEN', token: { type: 'BRACKET', source: '[' } }, { type: 'CLOSE', token: { type: 'BRACKET', source: ']' } } ],
        stack: [
          { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0' } } },
        ],
        opers: [], other : [], defer : [],
      }
    }
  ],
  opers: [], other : [], defer : [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '*Hello::World' } } },
  ],
  opers: [], other : [], defer : [],
}
    ],
    { verbose : false, develop : false }
),
]);

/*

*/
