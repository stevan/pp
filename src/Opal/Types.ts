// -----------------------------------------------------------------------------
// Configs
// -----------------------------------------------------------------------------

export type ParserConfig   = any
export type CompilerConfig = any;
export type RuntimeConfig  = {
    lib      : string,
    resolver : LibResolver,
    DEBUG    : boolean,
}

// -----------------------------------------------------------------------------

export type LibResolver = (config : RuntimeConfig, path : string) => InputSource;

// -----------------------------------------------------------------------------
// Source & Sink
// -----------------------------------------------------------------------------

export type Input = string;
export type Output = string[];

export type SyncOutputStream = Generator<Output, void, void>;

export type InputStream  = AsyncGenerator<Input,  void, void>;
export type OutputStream = AsyncGenerator<Output, void, void>;

export interface OutputSink {
    run  (source : OutputStream)     : Promise<void>;
    sync (source : SyncOutputStream) : Promise<void>;
}

export interface InputSource {
    run() : InputStream;
}

// -----------------------------------------------------------------------------

