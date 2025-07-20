<!----------------------------------------------------------------------------->
# TODO
<!----------------------------------------------------------------------------->

- loops

- Hashes
- figure out exactly what builtins to support


- Refs
- Anon
    - Array
    - Hash
    - Code



<!----------------------------------------------------------------------------->

- Remove GlobVar just like ScalarVar

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
