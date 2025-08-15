#!perl

use v5.40;

require './lib/Test.opal.pm';

$INC{'Test.pm'} = 1;

foreach my $file (@ARGV) {
    say "# ... testing($file) in Perl";
    try {
        do $file;
    } catch ($e) {
        say "ERROR! $e";
    }
}
