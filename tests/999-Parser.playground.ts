

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
        foreach my $x (@foo) {
            say $x;
        }


    `],
    [
    ],
    { verbose : true, develop : true }
),
]);

/*

        elsif (0 == 0) {}
        else {}

        while (0 == 0) {}
        until (0 == 0) {}

        for (my $i = 0; i < 10; $i++) {}

        foreach my $x (@foo) {}

*/
