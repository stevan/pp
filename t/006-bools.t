
use Test;

ok(not(false), '... not false is true');
ok(!(false), '... not false is true');
ok(!false, '... not false is true');

ok(!!(10), '... not not 10 is true');
ok(!!10, '... not not 10 is true');

is(!false, true, '... not false is true');
is(false, !true, '... not false is true');

ok(!false == true,  '... not false is true');
ok(false  == !true, '... not false is true');

done();
