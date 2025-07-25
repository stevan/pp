

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
new ParserTestCase('... qualified identifiers',
    [`
        if (0 == 0) {
            if (1 == 1) {
                10;
            }
        }
    `],
    [
    ],
    { verbose : true, develop : true }
),
]);

/*

*/
