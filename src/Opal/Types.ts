// -----------------------------------------------------------------------------
// Configs
// -----------------------------------------------------------------------------

export type ParserConfig   = any
export type CompilerConfig = any;
export type RuntimeConfig  = any

// -----------------------------------------------------------------------------
// Source & Sink
// -----------------------------------------------------------------------------

export type SourceStream  = AsyncGenerator<string,   void, void>;
export type OutputStream  = AsyncGenerator<string[], void, void>;

export interface OutputSink {
    run(source: OutputStream) : Promise<void>;
}

export interface InputSource {
    run() : SourceStream;
}

// -----------------------------------------------------------------------------
