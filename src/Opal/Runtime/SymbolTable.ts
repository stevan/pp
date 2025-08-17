
import {
    Stash, newStash, Glob, newGlob, isGlob, GV,
} from './API'

// -----------------------------------------------------------------------------
// Symbol Table
// -----------------------------------------------------------------------------
// This is very basic at the moment, but this should ultimately be kind of a
// in-memory NOSQL database. Passing a fully qualified symbol is the same as
// doing an primary key lookup, and it would be possible to have kind of a
// "query" syntax, which would be able to replace dynamically creating symbols
// at runtime. No idea what that might look like yet, but it is an idea.
//
// But treating this as a database allows us to save state, similar to an
// image file in Smalltalk or Forth, and be able to bypass the compilation
// and composition of a symbol table which won't change unless the file
// changes. This would also make it easier to have an interactive development
// environment similar to Unison and others.
// -----------------------------------------------------------------------------

export class SymbolTable {
    public root : Stash;

    constructor(name : string) {
        this.root = newStash(name);
    }

    name () : string { return this.root.name }

    // NOTE:
    // This works for now, but I do not like the
    // return values being so different, even though
    // they are from the same type. And the :: postfix
    // being important is also kinda janky and not
    // ideal. So this should eventually change to
    // be something less DWIM-ey, but yeah, kinda
    // works for now.
    autovivify (symbol : string) : GV {
        let path = symbol.split('::');
        if (path.length == 0) throw new Error('Autovivify path is empty');

        let wantStash = false;
        if (path[ path.length - 1 ] == '') {
            path.pop();
            wantStash = true;
        }

        let current = this.root;
        while (path.length > 0) {
            let segment = path.shift() as string;
            if (current.stash.has(segment)) {
                let next = current.stash.get(segment) as GV;
                // terminal case for lookup ...
                if (isGlob(next) && path.length == 0 && !wantStash) {
                    return next;
                }
                else {
                    current = next as Stash;
                }
            } else {
                // terminal case for auto creation ... we want a glob
                if (path.length == 0 && !wantStash) {
                    let glob = newGlob(segment);
                    current.stash.set(segment, glob);
                    return glob;
                }
                else {
                    let stash = newStash(segment);
                    current.stash.set(segment, stash);
                    current = stash;
                }
            }
        }

        // XXX:
        // perhaps add something here to check wantStash
        // and the type of current, to make sure we aren't
        // sending back the wrong type. Just an example of
        // the issues with this, but meh, I will come back.

        return current;
    }
}


