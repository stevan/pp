
use Test;

my $x = 10;
my $y = 20;
my $z = undef;

ok(defined($x),  '... x is defined');
ok(defined($y),  '... y is defined');
ok(!defined($z), '... z is not defined');

is($x, 10, '... x is 10');
is($y, 20, '... y is 20');

is($x + $y, 30, '... x + y == 30');

is($z, undef, '... z is undef');

# this is just to get a new scope
# it is not really to test the if
if (true) {

    my $y = 30;
    is($y, 30, '... (new) y is 30');
    is($x + $y, 40, '... x + (new) y == 40');

    ok(defined($x),  '... x is defined');
    ok(defined($y),  '... y is defined');
    ok(!defined($z), '... z is not defined');

    $z = 100;

    ok(defined($z), '... z is now defined');
    is($z, 100, '... z is 100');

    # same as above, just to
    # get a new scope ...
    unless (false) {

        my $x = 1;
        is($x, 1, '... (new) x is 1');
        is($x + $y, 31, '... (new) x + (new) y == 31');

        ok(defined($x),  '... x is defined');
        ok(defined($y),  '... y is defined');
        ok(defined($z), '... z is not defined');

        my $z = undef;

        ok(!defined($z), '... z is not defined');
    }

    is($x + $y, 40, '... x + (new) y == 40 (again)');

    ok(defined($z), '... z is defined (again)');
}

is($x + $y, 30, '... x + y == 30 (again)');

done();
