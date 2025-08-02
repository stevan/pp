
import { Opal } from '../src/Opal.js'

async function main() {
    const opal = new Opal();
    try {
        await opal.run();
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

main();
