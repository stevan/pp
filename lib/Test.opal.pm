
use v5.40; # ignore me

my $count = 1;
my $fails = 0;

sub todo ($msg) {
    diag('TODO: ' . $msg);
}

sub diag ($msg) {
    say '# ' . $msg;
}

sub pass ($msg) {
    say join ' ', 'ok', $count, $msg;
    $count = $count + 1;
}

sub fail ($msg) {
    say join ' ', 'not ok', $count, $msg;
    $count = $count + 1;
    $fails = $fails + 1;
}

sub ok ($test, $msg) {
    if ($test) {
        pass($msg);
    } else {
        fail($msg);
    }
}

sub is ($got, $expected, $msg) {
    ok($got == $expected, $msg);
    if ($got != $expected) {
        diag('Failed test ' . $msg);
        diag('       got: ' . $got);
        diag('  expected: ' . $expected);
    }
}

sub isnt ($got, $expected, $msg) {
    ok($got != $expected, $msg);
}

sub done () {
    say '1..' . $count;
    if ($fails > 0) {
        diag('looks like you failed ' . $fails . ' test(s) of ' . $count);
    }
}
