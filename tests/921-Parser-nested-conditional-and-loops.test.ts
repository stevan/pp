

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
              other: [],
              opers: [],
              defer: []
            }
          ]
        }
      ],
      other: [],
      opers: [],
      defer: []
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
            {
              type: 'OPERATION',
              operator: { type: 'UNOP', token: { type: 'ATOM', source: 'my' } },
              operands: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '=' } },
                  operands: [
                    { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '10' } } }
                  ]
                }
              ]
            }
          ],
          other: [],
          opers: [],
          defer: []
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
              other: [],
              opers: [],
              defer: []
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
                  other: [],
                  opers: [],
                  defer: []
                }
              ],
              other: [],
              opers: [],
              defer: []
            }
          ],
          other: [
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
                          other: [],
                          opers: [],
                          defer: []
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
                                {
                                  type: 'OPERATION',
                                  operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
                                  operands: [
                                    {
                                      type: 'EXPRESSION',
                                      lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                                      kind: ExpressionKind.LIST,
                                      stack: [
                                        {
                                          type: 'OPERATION',
                                          operator: { type: 'BINOP', token: { type: 'ATOM', source: '.' } },
                                          operands: [
                                            { type: 'TERM', value: { type: 'IDENTIFIER', token: { type: 'ATOM', source: '$x' } } },
                                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: '...' } } }
                                          ]
                                        }
                                      ],
                                      other: [],
                                      opers: [],
                                      defer: []
                                    }
                                  ]
                                }
                              ],
                              other: [],
                              opers: [],
                              defer: []
                            }
                          ],
                          other: [],
                          opers: [],
                          defer: []
                        }
                      ],
                      other: [],
                      opers: [],
                      defer: []
                    },
                    {
                      type: 'EXPRESSION',
                      lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                      kind: ExpressionKind.STATEMENT,
                      stack: [
                        {
                          type: 'OPERATION',
                          operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
                          operands: [
                            {
                              type: 'EXPRESSION',
                              lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                              kind: ExpressionKind.LIST,
                              stack: [
                                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: '... the end' } } }
                              ],
                              other: [],
                              opers: [],
                              defer: []
                            }
                          ]
                        }
                      ],
                      other: [],
                      opers: [],
                      defer: []
                    }
                  ],
                  other: [],
                  opers: [],
                  defer: []
                }
              ],
              other: [],
              opers: [],
              defer: []
            }
          ],
          opers: [],
          defer: []
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
          other: [],
          opers: [],
          defer: []
        }
      ],
      other: [],
      opers: [],
      defer: []
    }
  ],
  other: [],
  opers: [],
  defer: []
},
// -----------------------------------------------------------------------------
{
  type: 'EXPRESSION',
  lexed: [ { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
  kind: ExpressionKind.STATEMENT,
  stack: [
    {
      type: 'OPERATION',
      operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
      operands: [
        {
          type: 'EXPRESSION',
          lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
          kind: ExpressionKind.LIST,
          stack: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'goodbye' } } }
          ],
          other: [],
          opers: [],
          defer: []
        }
      ]
    }
  ],
  other: [],
  opers: [],
  defer: []
}
// -----------------------------------------------------------------------------
    ],
    { verbose : false, develop : false, pretty_print : false }
),
]);

/*

*/
