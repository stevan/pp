
import { logger, prettyPrinter } from '../src/Logger'
import {
    newStash,
    newGlob,
    newPV,
    newAV,
    newIV,
    newNV,
    SV_True,
    SV_Undef,
    newRV,
    SymbolTable,
    assertIsGlob
} from '../src/Runtime'

let main = new SymbolTable('main');

let foo = newGlob('foo');

foo.slots.SCALAR = newPV("FOO");
foo.slots.ARRAY  = newAV([
    newIV(10),
    SV_True,
    newNV(3.14),
    SV_Undef,
    newRV(foo.slots.SCALAR)
]);

main.root.stash.set('foo', foo);

let Bar = new SymbolTable('Bar');

main.root.stash.set('Bar', Bar.root);

let baz = main.autovivify('Bar::Gorch::baz');
assertIsGlob(baz);

baz.slots.SCALAR = newPV("BAZ");

let Gorch = main.autovivify('Bar::Gorch::');


logger.log(main);

