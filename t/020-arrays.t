
use Test;

my @foo = +[ 1, 2, 3, 4 ];

my $joined = join(', ', @foo);

is($joined, '1, 2, 3, 4', '... got the expected joined string');

done();
