// =============================================================================
// Interpreter
// -----------------------------------------------------------------------------
// This is the Interpreter implementation, not much to see here I guess.
// =============================================================================

import { logger } from './Logger'
import {
    SV, SymbolTable,
    OP, MaybeOP, OpTree,
    Pad
} from './Runtime'

import {
    InstructionSet,
    loadInstructionSet,
    Executor
} from './InstructionSet'

import { GlobSlot } from './AST'

// -----------------------------------------------------------------------------

export class Interpreter implements Executor {
    public stack   : SV[];
    public padlist : Pad[];
    public root    : SymbolTable;
    public opcodes : InstructionSet;

    constructor () {
        this.stack   = [];
        this.padlist = [ new Pad() ];
        this.root    = new SymbolTable('main');
        this.opcodes = loadInstructionSet();
    }

    // -------------------------------------------------------------------------
    // Lexicals
    // -------------------------------------------------------------------------

    getLexical (name : string) : SV {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                return scope.get(name) as SV;
            }
            index++;
        }
        throw new Error(`Unable to find lexical(${name}) in any scope`);
    }

    createLexical (name : string, value : SV) : void {
        this.currentScope().set(name, value);
    }

    setLexical (name : string, value : SV) : void {
        let index = 0;
        while (index < this.padlist.length) {
            let scope = this.padlist[index] as Pad;
            if (scope.has(name)) {
                scope.set(name, value);
                return;
            }
            index++;
        }
        this.createLexical(name, value);
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

    // -------------------------------------------------------------------------
    // Execution
    // -------------------------------------------------------------------------

    run (root : OpTree) : void {
        let op : MaybeOP = root.enter;
        while (op != undefined) {
            let opcode = this.opcodes.get(op.name);
            if (opcode == undefined) throw new Error(`Could not find opcode(${op.name})`);
            logger.group(`*OPCODE[${op.name}] = ${JSON.stringify(op.config)}`);
            op = opcode(this, op);
            logger.log('STACK   :', this.stack);
            logger.log('PADLIST :', this.padlist);
            logger.log('SYMTBL  :', this.root);
            logger.groupEnd();
        }
    }
}
