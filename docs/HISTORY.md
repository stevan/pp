<!----------------------------------------------------------------------------->
# HISTORY
<!----------------------------------------------------------------------------->

I did a little trip down memory lane after hearing about Matt, and went back to 
look at some old IRC logs and emails. For a while I'd been thinking about a 
conversation that Matt and I had back in 2007ish about the Perl core, and I 
finally managed to find it. At the time we were both pretty naive about the 
true horrors within the Perl core, but the ideas we discussed were solid enough 
to have gotten lodged in my brain for almost 20 years. 

This is the TL;DR IRC backlog:
```
Aug 05 13:21:07 <stevan>    I dont know the guts well enough
Aug 05 13:21:41 <stevan>    would writing something in opcode really save you much?
Aug 05 13:21:53 <stevan>    other than the parse phase
Aug 05 13:22:04 <mst>   I don't honestly think preserving opcodes is that big a deal
Aug 05 13:22:22 <mst>   I wasn't assuming we'd bother.
Aug 05 13:22:26 <stevan>    k
Aug 05 13:22:40 <mst>   strikes me a lot of the existing p5 ops would be better as macros onto more primitive ones
Aug 05 13:22:50 <stevan>    just trying to think of ways to slim up the bootstrap
Aug 05 13:22:51 <mst>   I -cannot- understand why map and grep are actually ops
Aug 05 13:22:57 <stevan>    probably speed
Aug 05 13:23:06 <mst>   yea
Aug 05 13:23:14 <mst>   but mapping them both to a hyper-optimised foldl ...
Aug 05 13:23:22 <stevan>    true
Aug 05 13:23:50 <stevan>    then you could make lots of other nice list functions with it :)
Aug 05 13:24:01 <stevan>    but I guess this is what I am thinking
Aug 05 13:24:05 <stevan>    could a slimmed down perl core
Aug 05 13:24:15 <stevan>    where only the most basic opcodes are left
Aug 05 13:24:19 <stevan>    be any faster/better
Aug 05 13:24:39 <stevan>    it would certainly give us more flexibility on top
Aug 05 13:27:21 <mst>   right
Aug 05 13:28:23 <mst>   I think the number of opcodes has blossomed as a matter of how the rest of the implementation is done
Aug 05 13:29:54 <stevan>    yeah
Aug 05 13:30:10 <mst>   I mean, map actually uses the 'grepstart' opcode
Aug 05 13:30:16 <mst>   but then mapwhile and grepwhile are different
Aug 05 13:30:24 <stevan>    I know with the Ruby VM (i dont remember the name) they have like 50 opcodes
Aug 05 13:30:38 <stevan>    but the whole VM has 250+ cause they have optimized combinations
Aug 05 13:30:47 <stevan>    I suspect similar things happend with perl
Aug 05 13:30:50 <mst>   yeah
Aug 05 13:30:57 <stevan>    just more organically (read: chaotically)
Aug 05 13:31:01 <mst>   I'd rather have a much smaller primitive set
Aug 05 13:31:11 <mst>   and let the optimisations be separate
Aug 05 13:31:15 <stevan>    yes
Aug 05 13:31:17 <mst>   pattern match across the tree, basically
Aug 05 13:35:10 <mst>   christ. half the ops could be imports
Aug 05 13:35:26 <mst>     "gsockopt",
Aug 05 13:35:26 <mst>     "ssockopt",
Aug 05 13:35:26 <mst>     "getsockname",
Aug 05 13:35:26 <mst>     "getpeername",
Aug 05 13:35:26 <mst>     "lstat",
Aug 05 13:35:27 <stevan>    eah?
Aug 05 13:35:28 <mst>   etc,
Aug 05 13:35:30 <stevan>    oh yeah
Aug 05 13:37:31 <mst>   by my reckoning, the pad ops, local(), the unops and binops, a couple conditionals a loop and a fold would probably do the trick
Aug 05 13:37:39 <mst>   plus obviously the method/sub dispatch stuff
Aug 05 13:37:55 <stevan>    well
Aug 05 13:38:05 <stevan>    that could be implemented on top 
Aug 05 13:38:11 <stevan>    if we can get first class packages out of this
Aug 05 13:38:26 <stevan>    then we just need the ability to create ops
Aug 05 13:38:58 <stevan>    :P
Aug 05 13:39:02 <mst>   hehehe
Aug 05 13:39:55 <mst>   but I reckon the vast majority of the rest is just "NCI it in"
Aug 05 13:40:04 <mst>   no reason I/O shouldn't be a library that happens to be in core
Aug 05 13:40:13 <stevan>    yup
Aug 05 13:40:27 <stevan>    ok,.. time to go,.. the family is back and it's lunchtime
Aug 05 13:40:30 <mst>   k
Aug 05 13:40:42 <stevan>    lets continue this later though
Aug 05 13:41:40 <mst>   yeah
```

<!----------------------------------------------------------------------------->
