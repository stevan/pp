<!----------------------------------------------------------------------------->
# BUILTINS
<!----------------------------------------------------------------------------->

<!----------------------------------------------------------------------------->
## Boolean Operations
<!----------------------------------------------------------------------------->

### Unary Operators

`(Any) => Bool`

- not, !
- defined

### Binary Operators

`(Any, Any) => Bool`

- eq, ==
- ne, != 

- ge, >=
- gt, >
- le, <=
- lt, <

- and, &&
- or,  ||
- xor, //

`(Any, ClassName) => Bool`

- isa
- ref

`(Any, Any) => -1 | 0 | 1`

- cmp, <=>

<!----------------------------------------------------------------------------->
## String Operations
<!----------------------------------------------------------------------------->

## Binary Operations

`(Str, Int) => Str`
- x
- .

## Unary Operators

`(Str) => Str`
- chomp
- chop
- reverse
- fc
- lc
- lcfirst
- uc
- ucfirst

`(Str) => Int`
- length

`(Str) => Num`
- chr
- oct
- ord
- hex

### Built-ins

`(Str, Str) => Int`
- index
- rindex

`(Str, Str) => Str[]`
- split

`(Str, ???) => Str`
- substr

`(Str, Array) => Str`
- join

<!----------------------------------------------------------------------------->
## Numeric Operations
<!----------------------------------------------------------------------------->

## Binary Operators

`(Num, Num) => Num`

- `+, -, *, /, %`

## Unary Operators

`(Num) => Num`
- abs
- sin
- cos
- atan2
- sqrt
- exp
- log
- hex
- oct
- rand

<!----------------------------------------------------------------------------->
## Array Operations
<!----------------------------------------------------------------------------->

## Unary Operators

`(Array) => Any`
- pop
- shift

`(Array) => Array`
- reverse

`(Array) => Int`
- length

## Built-in Functions

`(Array, Any[]) => void`
- push
- unshift

`(Array, ???) => Array`
- splice

`(Array, Code) => Array`
- sort
- all
- any
- grep
- map

<!----------------------------------------------------------------------------->
## Hash Operations
<!----------------------------------------------------------------------------->

## Unary Operators

`(Hash) => Keys[]`
- keys

`(Hash) => Values[]`
- values

## Built-in Functions

`(Hash, Key) => Value`
- delete

`(Hash, Key) => Bool`
- exists

<!----------------------------------------------------------------------------->
## Basic I/O
<!----------------------------------------------------------------------------->

## Built-in Functions

`(Str[]) => void`
- say
- print
- warn
- die

`() => Str`
- getc

<!----------------------------------------------------------------------------->
# Keywords
<!----------------------------------------------------------------------------->

## Control Keywords

- do
- exit

- try
    - catch
    - finally

- if
- unless
    - else
    - elsif

- until
- while
- for
- foreach
    - continue
    - break
    - last
    - next
    - redo

## Keywords related to Declarations

- local
- my
- our
- state

- class
    - field
    - method

- sub
    - return

- package
    - no
    - require
    - use

## Phaser Keywords

- BEGIN
- INIT
- CHECK
- UNITCHECK
- END

## Compile time Markers

- __SUB__
- __PACKAGE__
- __CLASS__


<!----------------------------------------------------------------------------->
