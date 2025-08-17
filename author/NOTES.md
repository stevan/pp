<!----------------------------------------------------------------------------->
# NOTES
<!----------------------------------------------------------------------------->

<!----------------------------------------------------------------------------->


```
Parser {
    
    let %INC : Map<Filename, Promise<AST>>;
    
    let $UNIT => new Promise<AST>(...);

    // takes an inital input stream ...
    while: Input Stream 
            -> Toke/Lex 
            -> Statement {
        // loops through each statement
        switch (s.keyword) {
            // if it is a use statement, then
            case 'use': 
                // we add a Promise<AST>
                // to the %INC hash  
                %INC{s.keyword.module_filename} = new Promise<AST>((resolve) => {
                    let p = new Parser(s.keyword.module_filename, this);
                    p.run().then((ast) => resolve(ast));    
                });
                break;            
            // if it is the end of the file 
            case 'EOF':
                // then we return a Promse to resolve all the 
                // %INC entries and the unit
                return new Promise<this>((resolve) => {
                    Promise<AST[]>.all([ $UNIT, %INC.values() ]);
                })
            default:
                // otherwise we just add the statement to the unit.
                $UNIT.addStatement(s);
        }        
    }
                
}
```































<!----------------------------------------------------------------------------->

But not just at the start of the pipeline. Take this kinda insane idea for 
instance. 

Start from Step 1 and make sure to read the descriptions at the bottom 
about what each thing is, it will help a bit (I think).

// Step 5. Checks to see if this AST has changed 
// or not and lets a distributes compiler know 
// what it needs to do. 
DistributesASTCache.run(
    // Step 4. take the stream of Lexical tokens 
    // and construct parse Trees
    // and stream them to step 5.
    treeParser.run(
        // Step 3. performs lexical analysis on each token 
        // and stream it to Step 4.
        LexerService.run(
            // Step 2. tokenize each chunk and streams it to Step 3.
            tokenizer.run(
                // Step 1. fetches from git server and streams to Step 2.
                GitService.getInputStream(
                    'http://git.foo.com/-/main/lib/Foo.pm',
                    { 
                        // 1a. send 1000 characters at a time ...
                        chunkSize : 1000 
                    }
                )
            ),
            {
                language : 'Perl',
                policies : [ 'NoEvalString', ... ]
            }
        )
    ),
    {
        memecache_servers : [ ... ]
    }
)

- `tokenizer` is a local instance of a Tokenizer object
- `treeParser` is a local instance of a TreeParser object


- `GitService` is an HTTP client in disguise
- `LexerService` is a module that can access a database that stores information 
  about tokens for a given language, and can provide lexical analysis as well 
  as enforce policies about what language features are allowed, etc. 
- `DistributesASTCache` would take each ParseTree that came out of the
  `treeParser` and using "hash consing", determine if that tree/sub-tree has 
  changed or not. If it has not changed, then that portion of the OpTree does 
  not need to be recompiled by the compiler. 
  
  












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
## Optree
<!----------------------------------------------------------------------------->

- Looking at the gcd example ...

then `return` opcodes are the only way out of this subroutine
and they will immediately exit, and not go through leavescope, 
(through goto) and then to leavesub. 

The perl compiler now will null out these opcodes, since 
they can never be visited. 

This could possibly be an issue if leavescope needed to do 
something, but in most cases, things would get cleaned up
when the stack frame is dropped. The same is true for leavesub
which basically just does the same as return (at least for now).

This works as long as there is absolutely no difference between 
explicit and implicit returns. But I think that this is correct. 

```
[05]  leave {} [next = null]
[04]    enter {} [next = 06]
[06]    nextstate {} [next = 29]
[29]    declare { name: 'gcd' } [next = 05]
[08]      leavesub {} [next = null]
[07]        entersub { name: 'gcd', params: [ 'a', 'b' ] } [next = 09]
[09]        nextstate {} [next = 10]
[28]        goto {} [next = 08]
[27]          cond_expr {} [other = 12, next = 17]
[01]            eq { operation: '==' } [next = 27]
[10]              padsv_fetch { target: { name: 'b' } } [next = 11]
[11]              const { literal: 0, type: 'IV' } [next = 01]
[13]            leavescope {} [next = 28]
[12]              enterscope {} [next = 14]
[14]              nextstate {} [next = 15]
[16]              return {} [next = 13]
[15]                padsv_fetch { target: { name: 'a' } } [next = 16]
[18]            leavescope {} [next = 28]
[17]              enterscope {} [next = 19]
[19]              nextstate {} [next = 22]
[26]              return {} [next = 18]
[21]                callsub { name: 'gcd' } [next = 26]
[22]                  pushmark {} [next = 23]
[23]                  padsv_fetch { target: { name: 'b' } } [next = 24]
[02]                  modulo { operation: '%' } [next = 20]
[24]                    padsv_fetch { target: { name: 'a' } } [next = 25]
[25]                    padsv_fetch { target: { name: 'b' } } [next = 02]
[20]                  gv_fetch { target: { name: 'gcd', slot: 'CODE' } } [next = 21]
```

<!----------------------------------------------------------------------------->



