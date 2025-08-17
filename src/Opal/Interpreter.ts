
import { RuntimeConfig, OutputStream, InputSource, OutputSink, Output } from './Types'
import { OpTreeStream } from './Compiler'
import { Executor, ThreadID } from './Runtime'
import { Thread } from './Runtime/Thread'
import { SymbolTable } from './Runtime/SymbolTable'
import { OpTree, PV } from './Runtime/API'
import { FromFile } from './Input/FromFile'
import { Linker } from './Runtime/Linker'
import { Tape } from './Runtime/Tape'

class ThreadMap extends Map<ThreadID, Thread> {
    addThread(t : Thread) : void { this.set(t.tid, t) }
}

export const defaultRuntimeConfig : RuntimeConfig = {
    DEBUG    : false,
    lib      : './lib/',
    resolver : (config, path) : InputSource => { return new FromFile(config.lib + path) },
};

export class SyncOutput {
    constructor(
        public prefix  : string = '',
        public postfix : string = '') {}

    async *run (source: Generator<Output, void, void>) : AsyncGenerator<void, void, void> {
        //console.log(this.prefix, '... running', this.postfix)
        for (const result of source) {
            console.log(this.prefix, ...result, this.postfix);
            yield new Promise<void>((r) => r());
        }
    }
}

export class Interpreter {
    public config  : RuntimeConfig;
    public linker  : Linker;
    public main    : Thread;
    public root    : SymbolTable;
    public threads : ThreadMap;

    private tid_seq : ThreadID = 0;

    constructor (config : RuntimeConfig = defaultRuntimeConfig) {
        this.config  = this.loadConfig(config);
        this.linker  = new Linker();
        this.root    = new SymbolTable('main');
        this.threads = new ThreadMap();
        this.main    = this.createNewThread();
    }

    private loadConfig (config : RuntimeConfig) : RuntimeConfig {
        // XXX : verify stuff or something
        return config;
    }

    private createNewThread () : Thread {
        let thread = new Thread(
            ++this.tid_seq,
            this.root,
            this.config,
        );
        this.threads.addThread(thread);
        return thread;
    }

    async *run (source : OpTreeStream) : OutputStream {
        yield* this.main.run(this.linker.link(source));
    }

    async *play (tape: Tape) : OutputStream {
        yield* this.main.run(this.linker.link(tape.run()));
    }

    execute (optree: OpTree) : Generator<Output, void, void> {
        let linked = this.linker.linkOpTree(optree);
        return this.main.execute(linked);
    }

    spawn (optree : OpTree) : Promise<void> {
        let linked = this.linker.linkOpTree(optree);
        let thread = this.createNewThread();
        let sync   = new SyncOutput(`${thread.tid}`, ';');
        return new Promise<void>(async (resolve) => {
            for await (const unit of sync.run(thread.execute(linked))) {}
            resolve();
        });
    }
}
