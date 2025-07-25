
import {
    ParserTestRunner,
    ParserTestCase,

    MockLiteral,
} from '../src/Tester/ParserTestRunner'

import {
    ExpressionKind,
    newExpression, newTerm
} from '../src/Parser/TreeParser'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... simple number literals',
    [`
        123;
        1234567890198;
        0.001;
        55.003;
    `],
    [
        newExpression(ExpressionKind.BARE, [
           newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(1,  'NUMBER', '123'))]),
           newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(3,  'NUMBER', '1234567890198'))]),
           newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(5,  'NUMBER', '0.001'))]),
           newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(7,  'NUMBER', '55.003'))]),
        ])
    ],
    { verbose : false, develop : false }
),
new ParserTestCase('... simple string literals',
    [`
        'hello';
        "hello world";
    `],
    [
        newExpression(ExpressionKind.BARE, [
            newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(1,  'STRING', 'hello'))]),
            newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(3, 'STRING', 'hello world'))]),
        ])
    ],
    { verbose : false, develop : false }
),
new ParserTestCase('... simple constant literals',
    [`
        true;
        false;
        undef;
    `],
    [
        newExpression(ExpressionKind.BARE, [
            newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(1, 'ATOM', 'true'))]),
            newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(3, 'ATOM', 'false'))]),
            newExpression(ExpressionKind.STATEMENT, [ newTerm(MockLiteral(5, 'ATOM', 'undef'))]),
        ])
    ],
    { verbose : false, develop : false }
),
]);
