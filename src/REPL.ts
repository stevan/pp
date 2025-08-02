import * as readline from 'readline';

import {
    InputSource,
    SourceStream,
} from './Types'

export class REPL implements InputSource {
    private readline : readline.ReadLine;
    private running  : boolean;

    constructor() {
        this.running  = false;
        this.readline = readline.createInterface({
            input  : process.stdin,
            output : process.stdout
        });
    }

    async *run() : SourceStream {
        process.stdout.write([
"    ▄▄               ▖ ",
"   ▟▜▜█▖           ▝▟  ",
"  ▞█▐ ▜▙  ▖ ▖  ▗▖▗  █  ",
" ▐▌█▐▗▀█ ▞█▞█▖▗▀█▌  █  ",
" ▐▌█▐▘▄█  █ ▐▌▚ ▐▌  █  ",
" ▐▌▛▐▞ ▛  █ ▐▌▗▀▜▌  █  ",
" ▝█▖▐ ▟▘ ▗█▖▟▌█▖▐▌  █  ",
"  ▀██▛▘   █▜█▘▜█▜▙ ▀█▖ ",
"          █ ▘  ▘ ▘  ▝  ",
"         ▝▀▖    v0.0.1 ",
"",
"Type :q to quit",
"",
        ].join('\n') + '\n');

        this.running = true;
        while (this.running) {
            yield new Promise<string>((resolve) => {
                this.readline.question('? ', (answer : string) => {
                    if (answer == ':q') {
                        this.running = false;
                        answer = '';
                    }
                    resolve(answer);
                });
            })
        }
        this.readline.close();
    }
}
