
# EXAMPLES

```

# 039-AST.test.ts
sub fib ($n) {
    if ($n < 2) {
        return $n;
    } else {
        return fib( $n - 1 )
             + fib( $n - 2 );
    }
}

# 040-AST.test.ts
sub fact ($n) {
    if ($n == 0) {
        return 1;
    } else {
        return $n * fact( $n - 1 )
    }
}

# 041-AST.test.ts
sub gcd ($a, $b) {
    if ($b == 0) { 
        return $a 
    } else { 
        return gcd($b, $a % $b) 
    }
}

# ------------------------------------------------------------------------------
# these are heavy recursion functions
# ------------------------------------------------------------------------------

# this requires elsif
sub ackermann ($m, $n) {
    if ($m == 0) {
        return $n + 1;
    } elsif ($n == 0) {
        return ackermann($m - 1, 1);
    } else {
        return ackermann($m - 1, ackermann($m, $n - 1));
    }
}

# this one requires string concatination
sub hanoi ($n, $source, $target, $aux) {
    if ($n > 0) {
        hanoi($n-1, $source, $aux, $target);
        say "Move disk $n from $source to $target\n";
        hanoi($n-1, $aux, $target, $source);
    }
}

# this requires logical or
sub binomial ($n, $k) {
    return 1 if $k == 0 || $k == $n;
    return binomial($n-1, $k-1) + binomial($n-1, $k);
}

# ------------------------------------------------------------------------------
# these requires me to figure out / and the IV/NV thing 
# ------------------------------------------------------------------------------

sub sum_digits ($n) {
    return 0 if $n == 0;
    return ($n % 10) + sum_digits(int($n / 10));
}

sub collatz ($n) {
    print "$n\n";
    return if $n == 1;
    if ($n % 2 == 0) {
        collatz($n / 2);
    } else {
        collatz(3 * $n + 1);
    }
}


```
