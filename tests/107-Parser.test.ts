

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
new ParserTestCase('... nested control structures',
    [`
        if (0 == (1 + 1)) {
            my $x = 10;
            if (1 == 1) {
                10;
            } else {
                while (true) {
                    say $x . "...";
                }
                say "... the end";
            }
            $x = $x + 1;
        }
        say "goodbye";
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
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } }
                  ]
                }
              ],
              opers: []
            }
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
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
          kind: ExpressionKind.STATEMENT,
          stack: [
            { type: 'TERM', value: { type: 'KEYWORD', token: { type: 'ATOM', source: 'my' } } },
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
              operands: [
                { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10' } } }
              ]
            }
          ],
          opers: []
        },
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
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } }
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
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.STATEMENT,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10' } } }
                  ],
                  opers: []
                }
              ],
              opers: []
            }
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
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'while' } } ],
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
                        {
                          type: 'EXPRESSION',
                          lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                          kind: ExpressionKind.STATEMENT,
                          stack: [
                            { type: 'TERM', value: { type: 'BAREWORD', token: { type: 'ATOM', source: 'say' } } },
                            {
                              type: 'OPERATION',
                              operator: { type: 'BINOP', token: { type: 'ATOM', source: '.' } },
                              operands: [
                                { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
                                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: '...' } } }
                              ]
                            }
                          ],
                          opers: []
                        }
                      ],
                      opers: []
                    }
                  ],
                  opers: []
                },
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.STATEMENT,
                  stack: [
                    { type: 'TERM', value: { type: 'BAREWORD', token: { type: 'ATOM', source: 'say' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: '... the end' } } }
                  ],
                  opers: []
                }
              ],
              opers: []
            }
          ],
          opers: []
        },
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
          kind: ExpressionKind.STATEMENT,
          stack: [
            {
              type: 'OPERATION',
              operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
              operands: [
                { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '+' } },
                  operands: [
                    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1' } } }
                  ]
                }
              ]
            }
          ],
          opers: []
        }
      ],
      opers: []
    }
  ],
  opers: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    { type: 'TERM', value: { type: 'BAREWORD', token: { type: 'ATOM', source: 'say' } } },
    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'goodbye' } } }
  ],
  opers: []
}
// -----------------------------------------------------------------------------
    ],
    { verbose : false, develop : false }
),
]);

/*

*/
