

export const Example = ``.trim().split(/\s+/);

export namespace Grammar {

    export namespace CompileTime {

        // `use` can function in two ways
        // - `use BAREWORD` which is just one operand any
        // - `use BAREWORD EXPRESSION` this too is just one operand
        // because the BAREWORD EXPRESSION turns into an APPLICATION
        // which basically means we are going to pass the expression
        // into the bareword as it is being created, just as if we
        // we passing arguments to a subroutine.
        export const UnaryOps = `

            use

        `.trim().split(/\s+/);

        // these are just basically
        // - `keyword BLOCK`
        export const Structural = `

            BEGIN INIT CHECK UNITCHECK END

        `.trim().split(/\s+/);
    }

    export namespace Operators {

        export const NullaryOps = `
            ;

        `.trim().split(/\s+/);

        export const UnaryOps = `

            !
            not

            -

        `.trim().split(/\s+/);

        export const BinaryOps = `
            ->

            , =>

            + - * / %
            . x

            == != <= >= <  >  <=>
            eq ne ge le gt lt cmp

            !   &&  || //
            not and or xor

            =

            ::

        `.trim().split(/\s+/);

        export const Structural = `

        ( ) { } [ ]

        +{ +[

        `.trim().split(/\s+/);
    }

    export namespace Declaration {

        // most of these are variations of
        // - keyword NAME METADATA BLOCK
        // where METADATA is things like
        // - arguments for a subroutine
        // - isa/does attributes
        // - version numbers
        // - etc.
        export const Keywords = `

            package class role

            sub method

        `.trim().split(/\s+/);

        // my, our, etc. are unary ops because
        // they expect either a variable to create
        // or an assignment expression
        /*
        For example:

        `my $foo;`

                (my)
                 |
               [$foo]

        `my $foo = 10;`

                (my)
                 |
                (=)
               /   \
            [$foo] [10]

        */
        // return will always take a single
        // value:
        // `return 10` - just returns single value
        // `return $x` - just returns single scalar
        // `return @x` - just returns single array (same for hash, etc)
        // `return (10, 20)` - returns a LIST
        // `return 10, 20` - returns a LIST (the , seperator will create one automagically in the parser)
        // `return` - returns UNIT, which is a special internal data type that means "i returned nothing" (see also FP languages)

        export const UnaryOps = `

            my our state local field

            return

        `.trim().split(/\s+/);

    }

    export const Control {



        // Most all of these follow the same pattern
        // - `keyword EXPRESSION BLOCK (CONTROL...)?`
        // where CONTROL is another control expression which follow these rules:
        // - `if` can be optionally followed by multiple `elseif`, and end with an optional `else`
        // - `unless` can end with an optional `else`
        // - `try` can be optionally followed by `catch`, an end with an optional `finally`
        // There are a few exceptions:
        // - `for` is a special kind of EXPRESSION because it has `;` markers
        // - `do`, `try`, `finally` and `else` do not have the EXPRESSION
        export const Keywords = `

            if unless elsif else

            while until

            for foreach

            try catch finally

            do

        `.trim().split(/\s+/);

        // these are all nullary ops, and
        // do not take arguments
        // (NOTE: we can deal with the label thing later)
        export const NullaryOp = `

            continue break last next redo

        `.trim().split(/\s+/);

    }


}
