

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
    ],
    { verbose : false, develop : true, pretty_print : false }
),
]);

/*

*/
