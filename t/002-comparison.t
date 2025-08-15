
use Test;

diag('Comparison tests');

ok(1 < 2, '... one is less than two');
ok(1 <= 2, '... one is less than or equal two');
ok(1 <= 1, '... one is less than or equal one');

ok(10 > 2, '... ten is greater than two');
ok(10 >= 2, '... ten is greater than or equal two');
ok(10 >= 10, '... ten is greater than or equal ten');

ok('a' lt 'b', '... a is less than b');
ok('a' le 'b', '... a is less than or equal b');
ok('a' le 'a', '... a is less than or equal a');

ok('b' gt 'a', '... b is greater than a');
ok('b' ge 'a', '... b is greater than  or equal a');
ok('b' ge 'b', '... b is greater than  or equal b');

todo('test errors of >/gt, etc. usage (when it is implemented)');

done();
