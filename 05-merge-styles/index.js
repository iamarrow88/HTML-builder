const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const srcFolderName = 'styles';
const newFileName = 'bundle.css';
const distFolderName = 'project-dist';

const pathToSrcFolder = path.resolve(__dirname, srcFolderName);
const pathToDistFolder = path.resolve(__dirname, distFolderName);
const pathToNewFile = path.resolve(pathToDistFolder, newFileName);

function createReadableStream(filePath) {
  return fs.createReadStream(filePath, 'utf-8');
}

async function createDistFolder(directoryPath) {
  return await fsPromises.mkdir(directoryPath, { recursive: true });
}

async function createNewCssFile(directoryPath) {
  const filePath = path.resolve(directoryPath, newFileName);
  return await fsPromises.writeFile(filePath, '');
}

function copyData(directoryPath, file) {
  const srcFilePath = path.resolve(directoryPath, file.name);
  const readStream = createReadableStream(srcFilePath);
  let result = '\n';

  readStream.on('data', (chunk) => {
    result += chunk;
  });

  readStream.on('end', () => {
    fs.appendFile(pathToNewFile, result.toString(), (err) => {
      if (err) console.log(err.message);
    });
  });
  readStream.on('error', (err) => console.log(err.message));
}

function selectCssFiles(directoryPath, callback) {
  fs.readdir(directoryPath, { withFileTypes: true }, (err, data) => {
    if (err) console.log(err.message);
    data.forEach((file) => {
      if (
        file.isFile() &&
        path.parse(path.resolve(directoryPath, file.name)).ext === '.css'
      ) {
        callback(directoryPath, file);
      }
    });
  });
}

function bundleCss() {
  createDistFolder(pathToDistFolder)
    .then(() => createNewCssFile(pathToDistFolder))
    .then(() => {
      selectCssFiles(pathToSrcFolder, copyData);
    });
}

bundleCss();
