

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
        %hash{ "hello" } = %hash { "hello" . "goodbye" };
        %hash{two} = 3;
    `,`
        my %hash = { one => 1, two => 2 };
        %hash{two} = 100;
    `],
    [
    ],
    {
        verbose : false,
        develop : true,
        pretty_print : true
    }
),
]);

/*
        my %hash = { one => 1, two => 2 };
        %hash{two} = 3;


        my $x = 1;
        my $y;
        {
           my $x = 10;
           $y = $x;
        }
        say $x + $y;

*/
