

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
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$hello' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$hello_world' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@a' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@array_of_stuff' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@arrayOfStuff' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '@ArrayOfStuff' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%h' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%hashes' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '%HASHOFTHINGS' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '&foo' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '&FooBar' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '*Testing' } } },
  ],
  opers: [],
  other: [],
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  kind: ExpressionKind.STATEMENT,
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  stack: [
    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '*foo' } } },
  ],
  opers: [],
  other: [],
}
    ],
    { verbose : false, develop : false }
),
]);
