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

export type Source = string;

export type SourceStream  = AsyncGenerator<Source,   void, void>;
export type OutputStream  = AsyncGenerator<Source[], void, void>;

export interface OutputSink {
    run(source: OutputStream) : Promise<void>;
}

export interface InputSource {
    run() : SourceStream;
}

// -----------------------------------------------------------------------------
