
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

import {
    walkExecOrder,
    walkTraversalOrder,
    Compiler,
} from '../src/Compiler'

import { OP, DECLARE } from '../src/Runtime'

import { Interpreter } from '../src/Interpreter'


let BEGIN = new Program([
    new Statement(
        new SubDefinition(
            'add_one_and_two',
            [],
            [
                new Statement(
                    new Add(
                        new ConstInt(1), new ConstInt(2)
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
            new SubCall(
                new GlobFetch('add_one_and_two', GlobSlot.CODE),
                []
            )
        )
    ),
    new Statement(
        new Say([ new ScalarFetch('x') ])
    )
]);

const prettyPrint = (op : OP, depth : number) : void => logger.log("  ".repeat(depth), op.name, op.config)

let compiler = new Compiler();

logger.log('... compiling BEGIN');
let comptime = compiler.compile(BEGIN);
logger.log('... compiling RUN');
let runtime  = compiler.compile(RUN);

logger.group('DEPARSE/BEGIN:');
logger.log(BEGIN.deparse());
logger.groupEnd();

logger.group('DEPARSE/RUN:');
logger.log(RUN.deparse());
logger.groupEnd();

logger.group('BEGIN/EXEC:');
walkExecOrder(prettyPrint, comptime.enter);
logger.groupEnd();

logger.group('RUN/EXEC:');
walkExecOrder(prettyPrint, runtime.enter);
logger.groupEnd();

logger.group('BEGIN/WALK:');
walkTraversalOrder(prettyPrint, comptime.leave);
logger.groupEnd();

logger.group('RUN/WALK:');
walkTraversalOrder(prettyPrint, runtime.leave);
logger.groupEnd();

let interpreter = new Interpreter();

logger.group('BEGIN/INTERPRET:');
logger.time('BEGIN elapased');
interpreter.run(comptime);
logger.timeEnd('BEGIN elapased');
logger.groupEnd();

logger.group('RUN/INTERPRET:');
logger.time('RUN elapased');
interpreter.run(runtime);
logger.timeEnd('RUN elapased');
logger.groupEnd();
