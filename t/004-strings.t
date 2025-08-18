
use Test;

is('hello ' . 'world', "hello world", '... got the expected string');
is('hello' . ' ' . 'world', "hello world", '... got the expected string');

is("hello " . "world", "hello world", '... got the expected string');
is("hello" . " " . "world", "hello world", '... got the expected string');

is("hello" . ' ' . 'world', "hello world", '... got the expected string');

done();
