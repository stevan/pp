

import {
    ParseTree,
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

sub add_one_and_two () {
    if (10 == 10) {
        1 + 2
    }
    10 - 20;
}

    `],
    [
    ],
    {
        verbose : true,
        develop : true,
        pretty_print : false,
    }
),
]);

/*

KEYWORD : BAREWORD ...       BLOCK
sub     : BAREWORD (PARENS)? BLOCK
package : BAREWORD (ATTRS)?  BLOCK



*/
