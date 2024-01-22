const fs = require('fs');
const path = require('path');

const fullPath = path.join(__dirname, 'text.txt');
const readableStream = fs.createReadStream(fullPath, 'utf-8');
let data = '';
readableStream.on('data', (chunk) => (data += chunk));
readableStream.on('end', () => console.log(data));
readableStream.on('error', (err) => console.log('Error! ' + err.message));
