<!----------------------------------------------------------------------------->
# DESIGN
<!----------------------------------------------------------------------------->

The design borrows heavily from the existing `perl` interpreter instead of 
trying to reinvent everything, we are trying to clean up, simplify instead. 

## High Level

Here is the high-level flow, nothing fancy or special here:

- a Parser produces an AST
- the AST compiles an OpTree
- given an InstructionSet and an OpTree the Interpreter executes it

The biggest difference is the introduction of an AST phase, which `perl` does
not have. It is during this phase when we can perform things like type checking
and static analysis. We can then use the information we gathered to inform the 
compilation of the OpTree (ex. - if we know the types, we do not need to do 
runtime checks on SV type). 

The AST is kind of the key to this whole thing, so it is quite important :)

## Low Level

Here is where we follow the `perl` interpreter more closely. 

First, we retain the basic OP structure. In particular the connections between 
them which determine the execution order (via the `.next` OP), and those which 
determine the tree structure (via the `.first` and `.sibling` OPs). This allows 
us to use `perl` itself as a partial reference implementation via the 
`B::Concise` module. (More on this later)

Second, we retain the symbol table and the SV/AV/HV/CV/GV structures, with some
minor modifications. Again, this lets us use `perl` as a reference 
implementation, and avoid having to rethink the opcodes.

Third is the opcodes, which are already designed to work with these things 
as well. And not only can we use `B::Concise` here for reference, we can also
look at the opcode definitions in the perl source for guidance. 

The hope is that this approach will reduce decision fatigue and remove the 
tempation of Second System Syndrome, as well as speed things up. 

This approach also brings additional benefits as it opens up a treasure trove 
of possible tweaks, improvements, optimizations and feature improvements that 
have been rejected over the years. 




