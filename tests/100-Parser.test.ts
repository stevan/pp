
import {
    ParserTestRunner,
    ParserTestCase,

    ExprStatement,
    ExprList,
    TermLiteral,
    TermOperator,
} from '../src/Tester/ParserTestRunner'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... simple literals',
    [`
        123;
        1234567890198;
        0.001;
        55.003;
        'hello';
        "hello world";
        true;
        false;
        undef;
    `],
    [
        ExprList([
            ExprStatement([ TermLiteral(1,  'NUMBER', '123')]),
            ExprStatement([ TermLiteral(3,  'NUMBER', '1234567890198')]),
            ExprStatement([ TermLiteral(5,  'NUMBER', '0.001')]),
            ExprStatement([ TermLiteral(7,  'NUMBER', '55.003')]),
            ExprStatement([ TermLiteral(9,  'STRING', 'hello')]),
            ExprStatement([ TermLiteral(11, 'STRING', 'hello world')]),
            ExprStatement([ TermLiteral(13, 'ATOM', 'true')]),
            ExprStatement([ TermLiteral(15, 'ATOM', 'false')]),
            ExprStatement([ TermLiteral(17, 'ATOM', 'undef')]),
        ])
    ],
    { verbose : false, develop : false }
),
new ParserTestCase('... simple binary operators on literals',
    [`
        1 + 2;
        0.001 - 9.999;
        20 * 0.01;
        100 / 2.5;
        2 % 0;
        3 + 10 - 200 * 2 / 0.3;
        "hello" . ' world';
    `],
    [
        ExprList([
            ExprStatement([ TermLiteral(1,  'NUMBER', '1'),     TermOperator(2, '+'),  TermLiteral(3,  'NUMBER', '2') ]),
            ExprStatement([ TermLiteral(5,  'NUMBER', '0.001'), TermOperator(6, '-'),  TermLiteral(7,  'NUMBER', '9.999') ]),
            ExprStatement([ TermLiteral(9,  'NUMBER', '20'),    TermOperator(10, '*'), TermLiteral(11, 'NUMBER', '0.01') ]),
            ExprStatement([ TermLiteral(13, 'NUMBER', '100'),   TermOperator(14, '/'), TermLiteral(15, 'NUMBER', '2.5') ]),
            ExprStatement([ TermLiteral(17, 'NUMBER', '2'),     TermOperator(18, '%'), TermLiteral(19, 'NUMBER', '0') ]),
            ExprStatement([
                TermLiteral(21, 'NUMBER', '3'),
                TermOperator(22, '+'),
                TermLiteral(23, 'NUMBER', '10'),
                TermOperator(24, '-'),
                TermLiteral(25, 'NUMBER', '200'),
                TermOperator(26, '*'),
                TermLiteral(27, 'NUMBER', '2'),
                TermOperator(28, '/'),
                TermLiteral(29, 'NUMBER', '0.3'),
            ]),
            ExprStatement([ TermLiteral(31, 'STRING', 'hello'), TermOperator(32, '.'), TermLiteral(33, 'STRING', ' world') ]),
        ])
    ],
    { verbose : false, develop : false }
),
]);
