

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

my $foo = 0;
if ($foo == 0) {
    $foo = 20;
} else {
    $foo = 10;
}


    `],
    [
    ],
    {
        verbose : false,
        develop : true,
        pretty_print : true,
    }
),
]);

/*

my $foo = 0;
if ($foo == 0) {
    $foo = 20;
} else {
    $foo = 10;
}

let RUN = new Program([
    new Statement(
        new ScalarDeclare('foo', new ConstInt(0))
    ),
    new Statement(
        new Conditional(
            new Equal(
                new ScalarFetch('foo'),
                new ConstInt(0)
            ),
            new Block([
                new Statement(
                    new ScalarStore('foo', new ConstInt(20))
                ),
            ]),
            new Block([
                new Statement(
                    new ScalarStore('foo', new ConstInt(10))
                ),
            ])
        )
    )

]);

*/
