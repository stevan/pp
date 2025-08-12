// -----------------------------------------------------------------------------
// Configs
// -----------------------------------------------------------------------------

export type ParserConfig   = any
export type CompilerConfig = any;
export type RuntimeConfig  = any

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
