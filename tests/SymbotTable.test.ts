
import { logger } from '../src/Logger'
import {
    newStash,
    newGlob,
    newPV,
    newAV,
    newIV,
    newNV,
    SV_True,
    SV_Undef,
    newRV
} from '../src/SymbolTable'

let main = newStash('main::');

let foo = newGlob('foo');

foo.slots.SCALAR = newPV("FOO");
foo.slots.ARRAY  = newAV([
    newIV(10),
    SV_True,
    newNV(3.14),
    SV_Undef,
    newRV(foo.slots.SCALAR)
]);

main.stash.set('foo', foo);

logger.log(main);

