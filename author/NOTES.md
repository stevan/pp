<!----------------------------------------------------------------------------->
# NOTES
<!----------------------------------------------------------------------------->



<!----------------------------------------------------------------------------->
## Compiler Phases
<!----------------------------------------------------------------------------->

This is a rant from WhatsApp on the topic ... 

```
So the full compilation process would be something like this:

Read main source file
- Parse it into AST
- Find all module dependencies and follow this process for each one recursively

Perform operations on all ASTs
- Type checking, etc.
- Removing unused nodes (tree shaking?) 

Then take all the ASTs (the main program, and any dependent modules) and compile them into separate units that hold tapes for the different compiler phases (just BEGIN/RUN for now). 

Compile all the static items (subs, classes, etc.)
- create a BEGIN tape that will initialize these

Compile all the runtime items (the main program basically)
- create a RUN tape that will execute this

Then after we've collected all the BEGIN/RUN tapes from all of the modules/compiled units we splice them together so they run in the proper order. Then we feed the spliced tape into a player to execute, or into a mixer to run as a thread.
```

<!----------------------------------------------------------------------------->
### Translating Perl's Compiler Phases
<!----------------------------------------------------------------------------->

Just some ideas on how they might translate ... 

- CONSTRUCT
    - this is the default state, it means we are getting ready to do stuff
- START
    - this is the parsing & compilation of the main program
        - including any dependencies use-ed
        - BEGIN blocks are compiled by not yet run
- BEGIN
    - Runs each BEGIN block in order
        - Side effects are allowed, so you can:
            - adjust the symbol table
                - addition and updating are allowed, but no delete
            - add new AST nodes
                - and they will be compiled on the spot
            - tweak the opcode tree
                - probably can't change the tree, but could add metadata
- CHECK
    - unlike Perl we do NOT allow alteration here, only checking :)
        - you can check the AST
        - you can check the Optree
        - you can check the symbol table
- INIT
- RUN
- END
- DESTRUCT

<!----------------------------------------------------------------------------->
## SEE ALSO
<!----------------------------------------------------------------------------->

- https://perldoc.perl.org/perlmod
- https://perldoc.perl.org/variables/$%7B%5EGLOBAL_PHASE%7D
- https://www.effectiveperlprogramming.com/2011/03/know-the-phases-of-a-perl-programs-execution/


<!----------------------------------------------------------------------------->



