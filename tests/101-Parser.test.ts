

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
new ParserTestCase('... simple expressions',
    [`
        1 + 2;
        1 + 2 - 3;
        1 + (2 - 3);
        (1 + 2) - 3;
        (1 + 2) - (3 + 4);
        ((1 + 2) - ((3 * 4) / 5));
    `],
    [
        {
          type: 'EXPRESSION',
          kind: ExpressionKind.BARE,
          stack: [
            {
              type: 'EXPRESSION',
              kind: ExpressionKind.STATEMENT,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 2 } },
                  operands: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 1 } } },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 3 } } }
                  ]
                }
              ],
              opers: []
            },
            {
              type: 'EXPRESSION',
              kind: ExpressionKind.STATEMENT,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 6 } },
                  operands: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 5 } } },
                    {
                      type: 'OPERATION',
                      operator: { type: 'BINOP', token: { type: 'ATOM', source: '-', seq_id: 8 } },
                      operands: [
                        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 7 } } },
                        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 9 } } }
                      ]
                    }
                  ]
                }
              ],
              opers: []
            },
            {
              type: 'EXPRESSION',
              kind: ExpressionKind.STATEMENT,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 12 } },
                  operands: [
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 11 } } },
                    {
                      type: 'EXPRESSION',
                      kind: ExpressionKind.PARENS,
                      stack: [
                        {
                          type: 'OPERATION',
                          operator: { type: 'BINOP', token: { type: 'ATOM', source: '-', seq_id: 15 } },
                          operands: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 14 } } },
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 16 } } }
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
              kind: ExpressionKind.STATEMENT,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '-', seq_id: 24 } },
                  operands: [
                    {
                      type: 'EXPRESSION',
                      kind: ExpressionKind.PARENS,
                      stack: [
                        {
                          type: 'OPERATION',
                          operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 21 } },
                          operands: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 20 } } },
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 22 } } }
                          ]
                        }
                      ],
                      opers: []
                    },
                    { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 25 } } }
                  ]
                }
              ],
              opers: []
            },
            {
              type: 'EXPRESSION',
              kind: ExpressionKind.STATEMENT,
              stack: [
                {
                  type: 'OPERATION',
                  operator: { type: 'BINOP', token: { type: 'ATOM', source: '-', seq_id: 32 } },
                  operands: [
                    {
                      type: 'EXPRESSION',
                      kind: ExpressionKind.PARENS,
                      stack: [
                        {
                          type: 'OPERATION',
                          operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 29 } },
                          operands: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 28 } } },
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 30 } } }
                          ]
                        }
                      ],
                      opers: []
                    },
                    {
                      type: 'EXPRESSION',
                      kind: ExpressionKind.PARENS,
                      stack: [
                        {
                          type: 'OPERATION',
                          operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 35 } },
                          operands: [
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 34 } } },
                            { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4', seq_id: 36 } } }
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
              kind: ExpressionKind.STATEMENT,
              stack: [
                {
                  type: 'EXPRESSION',
                  kind: ExpressionKind.PARENS,
                  stack: [
                    {
                      type: 'OPERATION',
                      operator: { type: 'BINOP', token: { type: 'ATOM', source: '-', seq_id: 45 } },
                      operands: [
                        {
                          type: 'EXPRESSION',
                          kind: ExpressionKind.PARENS,
                          stack: [
                            {
                              type: 'OPERATION',
                              operator: { type: 'BINOP', token: { type: 'ATOM', source: '+', seq_id: 42 } },
                              operands: [
                                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '1', seq_id: 41 } } },
                                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '2', seq_id: 43 } } }
                              ]
                            }
                          ],
                          opers: []
                        },
                        {
                          type: 'EXPRESSION',
                          kind: ExpressionKind.PARENS,
                          stack: [
                            {
                              type: 'OPERATION',
                              operator: { type: 'BINOP', token: { type: 'ATOM', source: '/', seq_id: 52 } },
                              operands: [
                                {
                                  type: 'EXPRESSION',
                                  kind: ExpressionKind.PARENS,
                                  stack: [
                                    {
                                      type: 'OPERATION',
                                      operator: { type: 'BINOP', token: { type: 'ATOM', source: '*', seq_id: 49 } },
                                      operands: [
                                        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '3', seq_id: 48 } } },
                                        { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '4', seq_id: 50 } } }
                                      ]
                                    }
                                  ],
                                  opers: []
                                },
                                { type: 'TERM', value: { type: 'LITERAL', token: { type: 'NUMBER', source: '5', seq_id: 53 } } }
                              ]
                            }
                          ],
                          opers: []
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
        }
    ],
    { verbose : false, develop : false }
),
]);
