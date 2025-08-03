This repository asks the question:

If it ...
- looks mostly like Perl
- smells sort of like Perl
- even tastes a bit like Perl 
- but is *not* `perl` 

Is it Perl?

# Building

    cd path/to/this/repo
    npm install
    npm run build
    npm test

# Example

After building, you can run the example from this directory:

    ./examples/99-bottles.opal
    ./bin/opal examples/99-bottles.opal
    ./bin/opal -e 'say "Hello, world!";'

# Installation

To install opal as a standalone executable, you can use `pkg` to bundle it into
a single file for your platform.

First, install `pkg` if you haven’t already:

    npm install -g pkg

Then build the binary:

    pkg . --targets <target> --output ~/bin/opal
    chmod +x ~/bin/opal

Where `<target>` is one of:

| Platform              | Target Name          |
| --------------------- | -------------------- |
| macOS (Apple Silicon) | `node18-macos-arm64` |
| macOS (Intel)         | `node18-macos-x64`   |
| Linux (x86\_64)       | `node18-linux-x64`   |
| Linux (ARM)           | `node18-linux-arm64` |
| Windows (x64)         | `node18-win-x64`     |

(You can also cross-compile if you're on one OS and need a binary for another.)

Once built, the file at `~/bin/opal` can now be used directly in your scripts:

	#!/usr/bin/env opal

	say "Hello, World! (from Opal)";
