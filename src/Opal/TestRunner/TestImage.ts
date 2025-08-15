import assert from "node:assert"

import { logger } from '../Tools'

import { OutputStream, OutputSink, InputSource, RuntimeConfig } from '../Types'
import { FromArray } from '../Input/FromArray'
import { Parser, ASTNodeStream }  from '../Parser'
import { Compiler, OpTreeStream } from '../Compiler'
import { Interpreter }   from '../Interpreter'

export class TestInput extends FromArray {}

export class TestOutput implements OutputSink {
    public buffer : string[] = [];

    async run (source: OutputStream) : Promise<void> {
        for await (const result of source) {
            this.buffer.push(...result);
        }
    }
}

export type TestResult = {
    result      : 'OK',
    interpreter : Interpreter,
    output      : TestOutput
}

export class TestImage {
    public parser      : Parser;
    public compiler    : Compiler;
    public interpreter : Interpreter;
    public output      : TestOutput;
    public preloads    : InputSource[];

    constructor(preloads : InputSource[] = []) {
        this.preloads    = preloads;
        this.parser      = new Parser();
        this.compiler    = new Compiler();
        this.interpreter = new Interpreter();
        this.output      = new TestOutput();
    }

    async *execute (input : InputSource) : OutputStream {
        yield* this.interpreter.run(
                    this.compiler.run(
                        this.parser.run(input.run())))
    }

    async run(
            source : string[],
            test   : (result : TestResult) => void
        ) : Promise<void> {

        let input = new TestInput(source);

        try {

            for (const preload of this.preloads) {
                await this.output.run(this.execute(preload));
            }

            await this.output.run(this.execute(input));

            test({ result : 'OK', interpreter : this.interpreter, output : this.output });
        } catch (e) {
            assert.fail(`... test failed with: ${e}`);
        }
    }
}
