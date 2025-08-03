#!/usr/bin/env bin/opal

my $num = 99;
while ($num > 0) {

    my $s = '';
    unless ($num == 1) {
        $s = 's';
    }

    say $num . " bottle" . $s . " of beer on the wall, " . $num . " bottle" . $s . " of beer";

    $num = $num - 1;

    unless ($num == 1) {
        $s = 's';
    }

    if ($num == 0) {
        say "No more";
    } else {
        say "Take one down, pass it around, " . $num . " bottle" . $s . " of beer on the wall";
    }
}

say "No more bottles of beer on the wall, no more bottles of beer.";
say "Go to the store and buy some more, 99 bottles of beer on the wall.";

