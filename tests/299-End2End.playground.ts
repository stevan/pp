
import { logger } from '../src/Tools'

import { Interpreter } from '../src/Interpreter'

import { EndToEndTestRunner } from '../src/Tester/EndToEndTestRunner'

let i = EndToEndTestRunner([`


`], {
    verbose : true,
    quiet   : true,
});



