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

export type IOControl =
    | { type : 'INPUT' }
    | { type : 'OUTPUT' }

export type IOControlStream = Generator<IOControl, void, void>;


// -----------------------------------------------------------------------------
// Source & Sink
// -----------------------------------------------------------------------------

export type Input = string;
export type Output = string[];

export type InputStream  = AsyncGenerator<Input,  void, void>;
export type OutputStream = AsyncGenerator<Output, void, void>;

export interface OutputSink {
    run  (source : OutputStream) : Promise<void>;
}

export interface InputSource {
    run() : InputStream;
}

// -----------------------------------------------------------------------------

