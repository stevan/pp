
import { inspect } from "node:util"

import { Tape, Single, Mix } from './Tape'
import { Any, MaybeOP, OpTree } from './API'
import { Executor } from '../Runtime'

export type MaybeStackFrame = StackFrame | undefined

export class Pad extends Map<string, Any> {
    [inspect.custom] () {
        let pad : any = {};
        this.forEach((v, k, m) => pad[k] = v);
        return pad;
    }
}

export class StackFrame {
    public stack      : Any[];
    public padlist    : Pad[];
    public optree     : OpTree; // the CV basically
    public current_op : MaybeOP;
    public return_to  : MaybeOP;

    private parent : MaybeStackFrame;
    private thread : Executor;
    private tape   : Mix;

    constructor(
            optree    : OpTree,
            return_to : MaybeOP,
            thread    : Executor,
            parent?   : MaybeStackFrame,
        ) {
        this.stack      = [];
        this.padlist    = [ new Pad() ];
        this.tape       = new Mix([ optree ]);
        this.optree     = optree;
        this.return_to  = return_to;
        this.thread     = thread;
        this.parent     = parent;
        this.current_op = optree.enter;
    }

    appendOpTree (optree : OpTree) : void {
        this.tape.append(optree);
        this.optree     = optree;
        this.current_op = optree.enter;
    }

    // -------------------------------------------------------------------------
    // Symbol Table
    // -------------------------------------------------------------------------

    executor () : Executor { return this.thread }

    // -------------------------------------------------------------------------
    // Lexicals
    // -------------------------------------------------------------------------

    getLexical (name : string) : Any {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                return scope.get(name) as Any;
            }
            index++;
        }

        if (this.parent == undefined)
            throw new Error(`Unable to get lexical(${name}) in any scope`);

        return this.parent.getLexical(name);
    }

    createLexical (name : string, value : Any) : void {
        this.currentScope().set(name, value);
    }

    setLexical (name : string, value : Any) : void {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                scope.set(name, value);
                return;
            }
            index++;
        }

        if (this.parent == undefined)
            throw new Error(`Unable to set lexical(${name}) in any scope`);

        return this.parent.setLexical(name, value);
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    currentScope () : Pad { return this.padlist[0] as Pad }

    enterScope () : void { this.padlist.unshift(new Pad()) }
    leaveScope () : void {
        if (this.padlist.length == 1)
            throw new Error('Cannot leave the global scope!');
        this.padlist.shift()
    }
}
