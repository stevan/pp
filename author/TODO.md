# TODO

This is a non-exhaustive list of things that need to be 
done to move this from a Proof of Concept to something
more stable.

## Tokenizer

The tokenizer is not aware of the syntax of the language in some regards, but is too much aware in others. 

The splitter places importance on semicolons and commas, but is unaware of any other operators which should also cause things to be split.  

The splitter also handles the `+{` and `+[` bracket types specifically, which feels wrong to me. 

---

It operates on a stream of strings and treats each chunk as independent, which is not really correct. It needs to be able to buffer as needed to handle times when a token spans multiple chunks. But it also needs to have a limit, otherwise this could become a security issue. 

---

It needs to be able to track the input string position (line number and column position) across all the chunks as if they were a single string. 

---

The `Token` interface is not sufficient, and should be turned into 
a discriminating union with different Token types instead of just squishing it in one interface.

We have no notion of a Tokenizer Error, but there should be one and it should be part of the `Token` union type. 

---

The regular expressions are bad and need lots of work:

- SPLITTER
    - if can't decide, makes it an ATOM
        - this is not ideal
    - fails if NUMBER or STRING spans multiple chunks
        - just returns an ATOM
    - should detect a STRING start
        - if no closing quote
            - should buffer until one is found
    - what about NUMBER spanning multiple chunks?
        - if no space (???)
            - do what STRING does and buffer?

- IS_NUMBER
    - accepts leading zeros
        - but does not enforce octal/hex numbers
    - does not handle scientific notation

- IS_STRING
    - most certainly does not handle escaping properly
    - does not capture the type of quote (' or ")


## Lexer
