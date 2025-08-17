
import { inspect } from "node:util"

import { RuntimeConfig, OutputStream, InputSource, Output } from './Types'
import { OpTreeStream } from './Compiler'
import { StackFrame } from './Runtime/StackFrame'
import { Tape, Single, Mix } from './Runtime/Tape'
import {
    Any, PV, CV, GV, AnytoPV,
    PRAGMA,
    OP, MaybeOP, OpTree,
} from './Runtime/API'
import { SymbolTable } from './Runtime/SymbolTable'


// -----------------------------------------------------------------------------

export type ThreadID = number

export interface OutputHandle {
    pending : boolean;
    write (args : Any[]) : void;
    flush () : Output;
}

export interface Executor {
    config : RuntimeConfig;
    tid    : ThreadID;
    frames : StackFrame[];
    root   : SymbolTable;
    output : OutputHandle;

    run     (source : OpTreeStream) : OutputStream;
    execute (optree : OpTree)       : Output;

    invokeCV (cv : CV, args : Any[]) : MaybeOP;
    returnFromCV () : MaybeOP;
}

// -----------------------------------------------------------------------------
