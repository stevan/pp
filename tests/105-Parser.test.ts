

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
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$Hello::World', seq_id: 1 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'BAREWORD', token: { type: 'ATOM', source: 'Hello::World', seq_id: 3 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'SLICE',
      value: { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@Hello::World', seq_id: 5 } } },
      slice: {
        type: 'EXPRESSION',
        kind: ExpressionKind.SQUARE,
        stack: [
          { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0', seq_id: 7 } } }
        ],
        opers: []
      }
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '*Hello::World', seq_id: 10 } } }
  ],
  opers: []
}
    ],
    { verbose : false, develop : false }
),
]);

/*

*/
