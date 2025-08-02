

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

if (0 == 0) {
    say "Test 0 / if";

    if (0.5 == 0.5) {
        say "Test 0.5 / if";
    }
}

if (1 == 1) {
    say "Test 1 / if";
} else {
    say "Test 1 / else";
}

unless (2 == 2) {
    say "Test 2 / unless";
} else {
    say "Test 2 / else";
}

unless (3 == 3) {
    say "Test 3 / unless";
}

if (4 == 4) {
    say "Nested Test 4.0 / if";
    if (4.1 == 4.1) {
        say "Nested Test 4.1 / if";
    } else {
        say "Nested Test 4.1 / else";
    }
}

unless (5 == 5) {
    say "Test 5 / unless";
}

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
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 0 / if' } } }
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
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0.5' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '0.5' } } }
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
                      operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
                      operands: [
                        {
                          type: 'EXPRESSION',
                          lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                          kind: ExpressionKind.LIST,
                          stack: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 0.5 / if' } } }
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
            {
              type: 'OPERATION',
              operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
              operands: [
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.LIST,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 1 / if' } } }
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
                        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 1 / else' } } }
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
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '==' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2' } } }
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
              operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
              operands: [
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.LIST,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 2 / unless' } } }
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
                        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 2 / else' } } }
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
        {
          type: 'OPERATION',
          operator: { type: 'BINOP', token: { type: 'ATOM', source: '==' } },
          operands: [
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3' } } }
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
              operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
              operands: [
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.LIST,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 3 / unless' } } }
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
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4' } } }
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
              operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
              operands: [
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.LIST,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Nested Test 4.0 / if' } } }
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
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4.1' } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4.1' } } }
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
                      operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
                      operands: [
                        {
                          type: 'EXPRESSION',
                          lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                          kind: ExpressionKind.LIST,
                          stack: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Nested Test 4.1 / if' } } }
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
                                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Nested Test 4.1 / else' } } }
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
  lexed: [ { type: 'CONTROL', token: { type: 'ATOM', source: 'unless' } } ],
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
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '5' } } },
            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '5' } } }
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
              operator: { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } },
              operands: [
                {
                  type: 'EXPRESSION',
                  lexed: [ { type: 'LISTOP', token: { type: 'ATOM', source: 'say' } }, { type: 'TERMINATOR', token: { type: 'ATOM', source: ';' } } ],
                  kind: ExpressionKind.LIST,
                  stack: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'STRING', source: 'Test 5 / unless' } } }
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
// -----------------------------------------------------------------------------
    ],
    {
        verbose : false,
        develop : false,
        pretty_print : false,
    }
),
]);

/*

*/
