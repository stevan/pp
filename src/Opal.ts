import {
    logger,
    SourceStream,
    prettyPrinter,
    walkExecOrder,
    walkTraversalOrder,
} from './Tools'

import {
    prettyPrintParseTree
} from './Tester/ParserTestRunner'

import { Tokenizer }   from './Parser/Tokenizer'
import { Lexer }       from './Parser/Lexer'
import { TreeParser }  from './Parser/TreeParser'
import * as AST        from './Parser/AST'
import { Parser }      from './Parser'
import { Compiler }    from './Compiler'
import { Interpreter } from './Interpreter'
import { StackFrame }  from './Runtime'

import { Statement } from './Parser/AST'

export class Opal {
    private tokenizer   : Tokenizer;
    private lexer       : Lexer;
    private treeParser  : TreeParser;
    private parser      : Parser;
    private compiler    : Compiler;
    private interpreter : Interpreter;

    constructor(config: any = {}) {
        this.tokenizer   = new Tokenizer();
        this.lexer       = new Lexer();
        this.treeParser  = new TreeParser();
        this.parser      = new Parser();
        this.compiler    = new Compiler();
        this.interpreter = new Interpreter({
            DEBUG : true,
            QUIET : false,
        });
    }

    run(src: string[]): Interpreter {
        let source = SourceStream(src);

        this.interpreter.main.init();

        for (const parseTree of this.treeParser.run(this.lexer.run(this.tokenizer.run(source)))) {
            let node = this.parser.parse(parseTree);
            let stmt = this.compiler.compile(new AST.Program([node as Statement]));

            logger.group('EXEC ORDER:');
            walkExecOrder(prettyPrinter, stmt.enter);
            logger.groupEnd();

            logger.group('TREE ORDER:');
            walkTraversalOrder(prettyPrinter, stmt.leave);
            logger.groupEnd();

            let frame = this.interpreter.main.frames[0] as StackFrame;
            frame.current_op = stmt.enter;
            this.interpreter.main.execute();
        }

        return this.interpreter;
    }
}
