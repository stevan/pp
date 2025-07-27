

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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
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
  defer: [],
}
    ],
    { verbose : false, develop : false }
),
]);
