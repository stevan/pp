
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
        if (@foo[0] == 10) {
            @foo[ 10 + 20 ] = $bar{"100"};
        }
    `],
    [
    ],
    { verbose : true, develop : true }
),
]);
