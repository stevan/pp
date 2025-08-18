
use Test;

my $x = 10;
my $y = 20;

is($x, 10, '... x is 10');
is($y, 20, '... y is 20');

is($x + $y, 30, '... x + y == 30');

# this is just to get a new scope
# it is not really to test the if
if (true) {

    my $y = 30;
    is($y, 30, '... (new) y is 30');
    is($x + $y, 40, '... x + (new) y == 40');

    # same as above, just to
    # get a new scope ...
    unless (false) {

        my $x = 1;
        is($x, 1, '... (new) x is 1');
        is($x + $y, 31, '... (new) x + (new) y == 31');

    }

    is($x + $y, 40, '... x + (new) y == 40 (again)');
}

is($x + $y, 30, '... x + y == 30 (again)');

done();
