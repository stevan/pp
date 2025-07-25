

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
new ParserTestCase('... simple identifiers',
    [`
        $x;
        $hello;
        $hello_world;
        @a;
        @array_of_stuff;
        @arrayOfStuff;
        @ArrayOfStuff;
        %h;
        %hashes;
        %HASHOFTHINGS;
        &foo;
        &FooBar;
        *Testing;
        *foo;
    `],
    [
    ],
    { verbose : false, develop : true }
),
]);

/*

        my $x = 10;
        if ($x == 0) {
            say $x . " is zero";
        } else {
            say $x . " is not zero";
        }
        say "All done!";

*/
