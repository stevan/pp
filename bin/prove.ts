
import {
    TestImage, TestResult, TestInput,
} from '../src/Opal/TestRunner/TestImage'

import { FromFile } from '../src/Opal/Input/FromFile'

async function main(filesToRun : string[]) {
    let img = new TestImage();

    for (const file of filesToRun) {
        console.log(`# -- running file(${file}) --`)
        await img.run(new FromFile(file), (result : TestResult) => {
            for (const out of result.output.flush()) {
                console.log(out);
            }
        });
        console.log('');
    }
}

let files = process.argv.splice(2);

if (files.length == 0) throw new Error('You must supply a file to run');

main(files);
