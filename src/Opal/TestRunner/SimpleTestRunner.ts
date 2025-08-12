import assert from "node:assert"

import {
    logger,
    prettyPrinter,
} from '../Tools'

import {
    SourceStream,
    OutputStream,

    InputSource,
    OutputSink,

    RuntimeConfig,
} from '../Types'

import { FromArray } from '../Input/FromArray'

import { REPL }          from '../Input/REPL'
import { Parser }        from '../Parser'
import { Compiler }      from '../Compiler'
import { Interpreter }   from '../Interpreter'
import { ConsoleOutput } from '../Output/ConsoleOutput'

import { walkExecOrder, walkTraversalOrder } from '../Compiler/OpTreeWalker'

import * as AST        from '../Parser/AST'
import { StackFrame }  from '../Runtime'

export class TestInput extends FromArray {}

export class TestOutput implements OutputSink {
    public buffer : string[] = [];

    async run (source: OutputStream) : Promise<void> {
        for await (const result of source) {
            this.buffer.push(...result);
        }
    }
}

export type TestResult = { result : 'OK', interpreter : Interpreter, output : TestOutput }

export async function SimpleTestRunner (
                            source : string[],
                            test   : (result : TestResult) => void,
                            config : RuntimeConfig = {}
                        ) : Promise<void> {

    let input       = new TestInput(source);
    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter(config);
    let output      = new TestOutput();

    let result : TestResult;
    try {
        await output.run(
            interpreter.run(
                compiler.run(
                    parser.run(
                        input.run()
                    )
                )
            )
        );

        test({ result : 'OK', interpreter, output });

    } catch (e) {
        assert.fail(`... test failed with: ${e}`);
    }

}
