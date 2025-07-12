import { Console } from 'console';

export const logger = new Console({
    stdout         : process.stdout,
    stderr         : process.stderr,
    inspectOptions : { depth : Infinity },
});

