
import {
    ParserTestRunner,
    ParserTestCase,

    ExprStatement,
    TermLiteral,
    TermOperator,
} from '../src/Tester/ParserTestRunner'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... simple literals',
    [`
        my $x = 10;
        say $x;
    `],
    [
    ],
    { verbose : true, develop : true }
),
]);
