
import { test } from "node:test"
import  assert  from "node:assert"

import { logger, prettyPrinter, walkExecOrder, walkTraversalOrder } from '../src/Tools'
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
    isGlob, isStash,
    assertIsGlob,
} from '../src/Runtime/API'
import { SymbolTable } from '../src/Runtime'

test("... simple Runtime test", (t) => {
    let main = new SymbolTable('main');
    assert.strictEqual(main.name(), 'main');

    let foo = newGlob('foo');
    assert.strictEqual(foo.name, 'foo');
    assert.strictEqual(foo.type, 'GLOB');

    foo.slots.SCALAR = newPV("FOO");
    foo.slots.ARRAY  = newAV([
        newIV(10),
        SV_True,
        newNV(3.14),
        SV_Undef,
        newRV(foo.slots.SCALAR)
    ]);

    assert.strictEqual(foo.slots.SCALAR.value, 'FOO');
    assert.strictEqual(foo.slots.SCALAR.type,  'STR');

    assert.strictEqual(foo.slots.ARRAY.type, 'ARRAY');

    main.root.stash.set('foo', foo);

    let Bar = new SymbolTable('Bar');
    assert.strictEqual(Bar.name(), 'Bar');

    main.root.stash.set('Bar', Bar.root);

    let baz = main.autovivify('Bar::Gorch::baz');
    assert.strictEqual(baz.type, 'GLOB');
    assertIsGlob(baz);

    baz.slots.SCALAR = newPV("BAZ");

    assert.strictEqual(baz.slots.SCALAR.value, 'BAZ');
    assert.strictEqual(baz.slots.SCALAR.type,  'STR');

    let Gorch = main.autovivify('Bar::Gorch::');
    assert.strictEqual(Gorch.type, 'STASH');

    //logger.log(main);

});

