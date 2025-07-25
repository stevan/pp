
import {
    ParserTestRunner,
    ParserTestCase,

    MockLiteral,
    MockTerminator,
    MockStatement,
} from '../src/Tester/ParserTestRunner'

import {
    ExpressionKind,
    newExpression, newTerm
} from '../src/Parser/TreeParser'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... number literals',
    [`
        123;
        1234567890198;
        0.001;
        55.003;
    `],
    [
       MockStatement([ newTerm(MockLiteral('NUMBER', '123'))           ]),
       MockStatement([ newTerm(MockLiteral('NUMBER', '1234567890198')) ]),
       MockStatement([ newTerm(MockLiteral('NUMBER', '0.001'))         ]),
       MockStatement([ newTerm(MockLiteral('NUMBER', '55.003'))        ]),
    ],
    { verbose : false, develop : false }
),
new ParserTestCase('... string literals',
    [`
        'hello';
        "hello world";
    `],
    [
        MockStatement([ newTerm(MockLiteral('STRING', 'hello'))       ]),
        MockStatement([ newTerm(MockLiteral('STRING', 'hello world')) ]),
    ],
    { verbose : false, develop : false }
),
new ParserTestCase('... constant literals',
    [`
        true;
        false;
        undef;
    `],
    [
        MockStatement([ newTerm(MockLiteral('ATOM', 'true'))  ]),
        MockStatement([ newTerm(MockLiteral('ATOM', 'false')) ]),
        MockStatement([ newTerm(MockLiteral('ATOM', 'undef')) ]),
    ],
    { verbose : false, develop : false }
),
]);
