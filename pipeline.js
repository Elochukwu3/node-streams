import fs from 'fs';
import { pipeline } from 'stream/promises';

await pipeline(
    fs.createReadStream(import.meta.filename), //reads from the current file
    async function * (source) {
        for await (const key of source){
             yield key.toString().toUpperCase();//converts current file content to uppercase
        }
    },
    process.stdout //writes to the current file to the consoles
)