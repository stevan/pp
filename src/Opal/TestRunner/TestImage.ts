import assert from "node:assert"

import { logger } from '../Tools'

import { OutputStream, OutputSink, InputStream, InputSource, RuntimeConfig } from '../Types'
import { FromArray } from '../Input/FromArray'
import { FromFile  } from '../Input/FromFile'
import { Parser, ASTNodeStream }  from '../Parser'
import { Compiler, OpTreeStream } from '../Compiler'
import { Interpreter }   from '../Interpreter'

export class TestInput extends FromArray {}

export class TestOutput implements OutputSink {
    public buffer : string[] = [];

    flush () : string[] { return this.buffer.splice(0) }

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

export type TestCallback = (result : TestResult) => void;

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

    async *executeParser (input : InputStream) : ASTNodeStream {
        try {
            yield* this.parser.run(input)
        } catch (e) {
            logger.log('PARSER FAILED', e);
            throw new Error('Parser Error!');
        }
    }

    async *executeCompiler (input : ASTNodeStream) : OpTreeStream {
        try {
            yield* this.compiler.run(input)
        } catch (e) {
            logger.log('COMPILER FAILED', e);
            throw new Error('Compiler Error!');
        }
    }

    async *execute (input : InputSource) : OutputStream {
        yield* this.interpreter.run(
                    this.executeCompiler(
                    this.executeParser(
                    input.run())))
    }

    async run(input : InputSource, test : TestCallback) : Promise<void> {
        try {
            for (const preload of this.preloads) {
                await this.output.run(this.execute(preload));
            }

            await this.output.run(this.execute(input));

            test({ result : 'OK', interpreter : this.interpreter, output : this.output });
        } catch (e) {
            logger.log('TEST FAILED', e);
        }
    }
}
