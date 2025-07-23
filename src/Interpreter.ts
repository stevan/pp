

import { logger } from './Tools'
import { RuntimeConfig, Thread, ThreadMap, ThreadID } from './Runtime'
import { SymbolTable, OpTree } from './Runtime/API'

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

    run (root : OpTree) : void {
        this.main.run(root);
    }
}
