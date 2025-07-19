
import { logger } from '../src/Logger'
import {
    Program, Statement,
    ScalarVar, ScalarStore, ScalarFetch, ScalarDeclare,
    ConstInt,
    Add, Multiply, Subtract, Block,
    ConstUndef, GlobVar, GlobSlot, GlobDeclare, GlobFetch,
    Conditional, Equal, Say,
    SubDefinition, SubCall, SubReturn, SubBody,
} from '../src/AST'

import { DECLARE } from '../src/Runtime'

import { Interpreter } from '../src/Interpreter'


let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'adder',
            [ new ScalarVar('n'), new ScalarVar('m') ],
            [
                new Statement(
                    new SubReturn(
                        new Add(
                            new ScalarFetch('n'),
                            new ScalarFetch('m'),
                        )
                    )
                )
            ]
        )
    )
]);

let RUN = new Program([
    new Statement(
        new ScalarDeclare(
            new ScalarVar('x'),
            new Add(
                new SubCall(
                    new GlobFetch('adder', GlobSlot.CODE),
                    [ new ConstInt(10), new ConstInt(20) ]
                ),
                new SubCall(
                    new GlobFetch('adder', GlobSlot.CODE),
                    [ new ConstInt(5), new ConstInt(15) ]
                )
            )
        )
    ),
    new Statement(
        new Say([ new ScalarFetch('x') ])
    )
]);


function dump(op : any, depth : number = 0) {
    //logger.log(op);
    while (op != undefined) {
        logger.log("  ".repeat(depth), op.name, op.config);

        if (op.name == 'goto' && depth > 0) {
            return;
        }

        if (op.other) {
            dump(op.other, depth + 1);
        }

        op = op.next;
    }
}

function walk(op : any, depth : number = 0) {
    logger.log("  ".repeat(depth), op.name, op.config);
    for (let k : any = op.first; k != undefined; k = k.sibling) {
        walk(k, depth + 1);
    }
}

let comptime = BEGIN.emit();
let runtime  = RUN.emit();

//logger.log(op);

logger.group('DEPARSE/BEGIN:');
logger.log(BEGIN.deparse());
logger.groupEnd();

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('BEGIN/EXEC:');
dump(comptime.enter);
logger.groupEnd();

logger.group('RUN/EXEC:');
dump(runtime.enter);
logger.groupEnd();

logger.group('BEGIN/WALK:');
walk(comptime.leave);
logger.groupEnd();

logger.group('RUN/WALK:');
walk(runtime.leave);
logger.groupEnd();

let interpreter = new Interpreter();

logger.group('INTERPRET/BEGIN:');
interpreter.run(comptime);
logger.groupEnd();

logger.group('INTERPRET/RUN:');
interpreter.run(runtime);
logger.groupEnd();

