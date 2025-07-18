// =============================================================================
// Custom Console Logger
// -----------------------------------------------------------------------------
// Just a custom console logger, nothing to see here
// =============================================================================

import { Console } from 'console';

export const logger = new Console({
    stdout         : process.stdout,
    stderr         : process.stderr,
    inspectOptions : { depth : 4 },
});

