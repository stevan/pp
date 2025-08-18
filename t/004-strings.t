
use Test;

is('hello ' . 'world', "hello world", '... got the expected string');
is('hello' . ' ' . 'world', "hello world", '... got the expected string');

is("hello " . "world", "hello world", '... got the expected string');
is("hello" . " " . "world", "hello world", '... got the expected string');

is("hello" . ' ' . 'world', "hello world", '... got the expected string');

is(lc("HELLO"), 'hello', '... lc worked');
is(uc("hello"), 'HELLO', '... uc worked');

is(lc("HELL" . "O"), 'hello', '... lc worked on expression');
is(uc("he" . "ll" . "o"), 'HELLO', '... uc worked on expression');

is(length("hello"), 5, '... hello is 5 characters long');
is(length("he" . "ll" . "o"), 5, '... hello is 5 characters long (expression)');

is(length(1), 1, '... got the expected converted length for single number');
is(length(10), 2, '... got the expected converted length for number');
is(length(10000), 5, '... got the expected converted length for number');
is(length(10.43), 5, '... got the expected converted length for float');
is(length(true), 1, '... got the expected converted length for true');
is(length(false), 0, '... got the expected converted length for false');
is(length(undef), 0, '... got the expected converted length for undef');

done();
