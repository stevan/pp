


import {
    ParserTestRunner,
    ParserTestCase,
} from '../src/Tester/ParserTestRunner'

// -----------------------------------------------------------------------------

let runner = new ParserTestRunner();

runner.run([
new ParserTestCase('... nested control structures',
    [`

sub fact ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * fact( $n - 1 );
    }
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
