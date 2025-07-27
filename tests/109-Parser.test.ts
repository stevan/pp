

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

if (0 == 0) {
    say "Test 0 / if";
}

if (1 == 1) {
    say "Test 1 / if";
} else {
    say "Test 1 / else";
}

unless (2 == 2) {
    say "Test 2 / unless";
} else {
    say "Test 2 / else";
}

unless (3 == 3) {
    say "Test 3 / unless";
}

if (4 == 4) {
    say "Nested Test 4.0 / if";
    if (4.1 == 4.1) {
        say "Nested Test 4.1 / if";
    } else {
        say "Nested Test 4.1 / else";
    }
}


    `],
    [
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
    ],
    {
        verbose : false,
        develop : true,
        pretty_print : true,
    }
),
]);

/*

*/
