<!----------------------------------------------------------------------------->
# WTF
<!----------------------------------------------------------------------------->

When things go south, this document can help tell you where things are going 
wrong. It is not comprehensive, but is the stuff I've noticed as I am 
building and cleaning things up. 

## Tokenizer

This code is not very sophisticated and the regexp almost certainly need 
some work. The most common issues is usually that the splitting is not 
working correctly and tokens are being combined or split incorrectly. 

## Lexer

The lexer knows all the possible keyword, operators, control structures and 
builtins. If you need to add one of these, you have to start here. 

It is worth noting that there is some correspondence between the strings listed 
in the Lexer and the opcodes in the InstructionSet, specifically around any 
kind of built-in function. The same is true of the Parser, which 
looks checks the source strings while building the AST. 

Note, the above means that if you add/remove/change something in that list of 
keywords, operators, control-structures of builtins, .. you might need to also 
update InstructionSet and Parser accordingly. 

## TreeParser

This is basically an expression parser, it constructs the lexed tokens into 
a simple tree structure. For the most part this should work fine, unless you 
make significant changes to the lexer, or add something new that doesn't fit 
with the existing code. 

The tree parser works almost entirely based on the lexed token type and so 
will handle most things generically at that level. The one exception is for 
`if/unless` blocks with `else` statements attached, which are handled in a
specific manner within this code. 

It is worth noting here that this will consume many Lexed tokens for each 
one ParseTree it emits. This is because the TreeParser emits only top-level 
statements and not a ParseTree of the entire parsed source. 

## Parser

This basically takes the statement ParseTree and converts it into an AST. It 
does this by traversing the ParseTree, looking at the Lexed tokens and creating 
the appropriate nodes. 

The parser will actualy return AST Error objects when it runs into an issue, 
which could be handled better, but tend to work. 

If you look through this code and look for the places where a `TODO`, `HMMM`, 
or `FIXME` error is being returned, you will get an idea of what is missing in 
the parser. I have stubbed out a lot of things in this way, some would be 
fairly easy to finish, others require more work. The `HMMM` ones also need some
discussion as well. 

When adding something, you might have to make an AST node for it, or that 
AST node may already be there. You might need to parse it specifically, or 
it might just work as is, or it might do the wrong thing. You also may need 
to adjust the Lexer, and possibly the InstructionSet, and occasionally the 
OpTreeEmitter. It largely depends on what you are trying to do and how much 
of it has already been done.

It is worth noting that for every one ParseTree, we produce one AST. 

## Compiler

The compiler will take an AST and convert it into an OpTree. Then it will 
traverse that OpTree and bind all the Ops to the opcodes in the InstructionSet. 
Only at this point can the OpTree be executed by the interpreter. 

It is rare, but sometimes the OpTree is constructed incorrectly, and the 
OpTreeEmitter will complain something is missing. This is tricky, so I don't 
have much to help here. Ping me. 

It is worth noting that for every one AST, we produce one OpTree. 

## Interpreter

The Interpreter takes the OpTree and runs it, and emits Output tokens which 
are basically just `string[]` and get passed to an OutputStream. 

So this one pretty much works and as long as you 

It is worth noting that there is almost zero correspondence between the 
OpTree and the Output tokens. The output tokens are only emitted if 
something in the OpTree added to the STD/ERR buffers. 






