
import { test } from "node:test"
import  assert  from "node:assert"

import {
    logger,
    prettyPrinter,
} from '../src/Opal/Tools'

import { walkExecOrder, walkTraversalOrder } from '../src/Opal/Compiler/OpTreeWalker'

import { InputSource, InputStream } from '../src/Opal/Types'
import { Parser } from '../src/Opal/Parser'
import { Compiler } from '../src/Opal/Compiler'
import { Interpreter } from '../src/Opal/Interpreter'
import { Linker } from '../src/Opal/Runtime/Linker'
import { Mix } from '../src/Opal/Runtime/Tape'
import { ConsoleOutput } from '../src/Opal/Output/ConsoleOutput'

import {
    PRAGMA, OpTree
} from '../src/Opal/Runtime/API'

import * as AST from '../src/Opal/Parser/AST'

export class TestInput implements InputSource {
    constructor(public source : string[]) {}

    async *run() : InputStream {
        let i = 0;
        while (i < this.source.length) {
            yield this.source[i] as string;
            i++;
        }
    }
}


let test001 = async () => {

    let parser      = new Parser();
    let compiler    = new Compiler();
    let interpreter = new Interpreter();

    let thread1 = new TestInput([`
        my $x = 10;
        say 'Thread 1 - Starting';
        while ($x > 0) {
            say 'Thread 1 - Got ' . $x;
            $x = $x - 1;
        }
        say 'Thread 1 - Completed';
    `]);

    let thread2 = new TestInput([`
        my $x = 10;
        say 'Thread 2 - Starting';
        while ($x > 0) {
            say 'Thread 2 - Got ' . $x;
            $x = $x - 1;
        }
        say 'Thread 2 - Completed';
    `]);

    //let c1 = new ConsoleOutput('\x1b[34mT[001]:\x1b[31m', '\x1b[0m');
    //let c2 = new ConsoleOutput('\x1b[31mT[002]:\x1b[34m', '\x1b[0m');

    await Promise.all([
        parser.parse(thread1),
        parser.parse(thread2),
    ]).then(async (asts) => {
        let t1 = compiler.compile(asts[0] as AST.Program);
        let t2 = compiler.compile(asts[1] as AST.Program);

        await Promise.all([
            interpreter.spawn(t1 as OpTree),
            interpreter.spawn(t2 as OpTree),
        ])
    });

};

test001();

