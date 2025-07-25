

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
new ParserTestCase('... basic identifiers',
    [`
        $x;
        $hello;
        $hello_world;
        @a;
        @array_of_stuff;
        @arrayOfStuff;
        @ArrayOfStuff;
        %h;
        %hashes;
        %HASHOFTHINGS;
        &foo;
        &FooBar;
        *Testing;
        *foo;
    `],
    [
 {
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x', seq_id: 1 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$hello', seq_id: 3 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$hello_world', seq_id: 5 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@a', seq_id: 7 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array_of_stuff', seq_id: 9 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@arrayOfStuff', seq_id: 11 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@ArrayOfStuff', seq_id: 13 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%h', seq_id: 15 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hashes', seq_id: 17 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%HASHOFTHINGS', seq_id: 19 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '&foo', seq_id: 21 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '&FooBar', seq_id: 23 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '*Testing', seq_id: 25 } } }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '*foo', seq_id: 27 } } }
  ],
  opers: []
}
    ],
    { verbose : false, develop : false }
),
]);
