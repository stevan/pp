
use Test;

ok(not(undef), '... undef is not true');

is(undef, undef, '... undef is undef');

ok(defined(1), '... numbers are defined');
ok(defined('foo'), '... strings are defined');
ok(defined(0.15), '... floats are defined');
ok(defined(true), '... true is defined');
ok(defined(false), '... false is defined');

ok(not(defined(undef)), '... undef is not defined');

done();
