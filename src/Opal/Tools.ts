// =============================================================================
// Custom Console Logger
// -----------------------------------------------------------------------------
// Just a custom console logger, nothing to see here
// =============================================================================

import { Console } from 'console';

import {
    OP, COP, UNOP, BINOP, LOGOP, LOOPOP, LISTOP, MaybeOP,
} from './Runtime/API'

export const logger = new Console({
    stdout         : process.stdout,
    stderr         : process.stderr,
    inspectOptions : {
        depth       : 20,
        breakLength : process.stdout.columns - (process.stdout.columns / 4), // 75% of the screen
    },
});


// FIXME:
// also adjust the prettyPrinter to return a
// string instead of printing it to the console.
export function prettyPrinter (op : OP, depth : number) : void {
    const opType = (op : OP) : string => {
        switch (true) {
        case op instanceof COP    : return ';';
        case op instanceof LISTOP : return '@';
        case op instanceof LOGOP  : return '|';
        case op instanceof LOOPOP : return 'L';
        case op instanceof BINOP  : return '2';
        case op instanceof UNOP   : return '1';
        case op instanceof OP     : return '0';
        default:
            return '?'
        }
    }

    const opUID = (op : MaybeOP) : string => {
        if (op == undefined) return '..'
        return op.metadata.uid.toString().padStart(2, "0")
    }

    const opName = (op : MaybeOP) : string => {
        return (op?.name ?? '').padEnd(20, " ")
    }

    logger.log(
        `\x1b[32m[${opUID(op)}]\x1b[0m`,
        "  ".repeat(depth),
        `\x1b[34m<${opType(op)}>\x1b[0m`,
        `\x1b[33m${opName(op)}\x1b[0m`,
        (((op instanceof LOGOP || op instanceof LOOPOP))
            ? ((op instanceof LOOPOP)
                ? `\x1b[31m[next -> ${opUID(op.next)}]->(next -> ${opUID(op.next_op)}, last -> ${opUID(op.last_op)}, redo -> ${opUID(op.redo_op)})\x1b[0m`
                : `\x1b[35m[next -> ${opUID(op.next)}, other -> ${opUID(op.other)}]\x1b[0m`)
            : `\x1b[36m[next -> ${opUID(op.next)}]\x1b[0m`),
        op.config,
    );
}

