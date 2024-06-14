import https from 'https';
import { pipeline } from 'stream/promises';
import { Writable, Transform } from 'stream';
import fs from 'fs';

const url = 'https://www.gutenberg.org/cache/epub/100/pg100-images.html';
const writeStream = fs.createWriteStream('output.txt');

async function* transformLine(source) {
    let lineNum = 1;
    for await (const chunk of source) {
        let bookLines = chunk.toString().split('\n');
        for (const line of bookLines) {
            if (line.trim().length > 0) {
                yield `${lineNum++}: ${line}\n`;
            }
        }
    }
}

// Create a transform stream for logging pipeline progress (optional)
const logProgress = new Transform({
    transform(chunk, encoding, callback) {
        process.stdout.write('.');
        callback(null, chunk);
    }
});

async function fetchAndProcess(url) {
    return new Promise((resolve, reject) => {
        https.get(url, async (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                response.resume(); // Consume response data to free up memory
                return;
            }

            try {
                await pipeline(
                    response,
                    logProgress,
                    transformLine,
                    writeStream
                );
                console.log('\nPipeline succeeded.');
                resolve();
            } catch (err) {
                console.error('Pipeline failed.', err);
                reject(err);
            }
        }).on('error', reject);
    });
}

(async () => {
    try {
        await fetchAndProcess(url);
    } catch (err) {
        console.error('Failed to fetch and process the URL.', err);
    }
})();
