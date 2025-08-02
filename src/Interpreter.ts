
import { RuntimeConfig, OutputStream } from './Types'
import { OpTreeStream } from './Compiler'
import { Thread, ThreadID, SymbolTable } from './Runtime'
import { OpTree, PV } from './Runtime/API'

class ThreadMap extends Map<ThreadID, Thread> {
    addThread(t : Thread) : void { this.set(t.tid, t) }
}

export class Interpreter {
    public config  : RuntimeConfig;
    public main    : Thread;
    public root    : SymbolTable;
    public threads : ThreadMap;

    private tid_seq : ThreadID = 0;

    constructor (config : RuntimeConfig = {}) {
        this.config  = config;
        this.root    = new SymbolTable('main');
        this.threads = new ThreadMap();
        this.main    = this.initializeMainThread();
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
        yield* this.main.run(source);
    }

    get STDOUT() : any[] {
        return this.main.STD_buffer.map((pv : PV) => pv.value);
    }
}
