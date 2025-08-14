
import { RuntimeConfig, OutputStream, InputSource, OutputSink, Output } from './Types'
import { OpTreeStream } from './Compiler'
import { Thread, ThreadID, SymbolTable } from './Runtime'
import { OpTree, PV } from './Runtime/API'
import { FromFile } from './Input/FromFile'
import { Linker } from './Runtime/Linker'

class ThreadMap extends Map<ThreadID, Thread> {
    addThread(t : Thread) : void { this.set(t.tid, t) }
}

export const defaultRuntimeConfig : RuntimeConfig = {
    DEBUG    : false,
    lib      : './tests/lib/',
    resolver : (config, path) : InputSource => { return new FromFile(config.lib + path) },
};

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
        this.main    = this.initializeMainThread();
    }

    private loadConfig (config : RuntimeConfig) : RuntimeConfig {
        // XXX : verify stuff or something
        return config;
    }

    private initializeMainThread () : Thread {
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

    execute (optree: OpTree) : Output {
        let linked = this.linker.linkOpTree(optree);
        return this.main.execute(linked);
    }

    get STDOUT() : any[] {
        return this.main.STD_buffer.map((pv : PV) => pv.value);
    }
}
