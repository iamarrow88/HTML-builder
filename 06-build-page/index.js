const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const { createWriteStream } = require('node:fs');

const distFolderName = 'project-dist';
const distFolderPath = path.resolve(__dirname, distFolderName);
const newHtmlFileName = 'index.html';
const newHtmlPath = path.resolve(__dirname, distFolderName, newHtmlFileName);
const newCssFileName = 'style.css';
const newCssPath = path.resolve(__dirname, distFolderName, newCssFileName);
const newAssetsPath = path.resolve(__dirname, distFolderName, 'assets');

const componentsFolderPath = path.resolve(__dirname, 'components');
const stylesFolderPath = path.resolve(__dirname, 'styles');
const assetsFolderPath = path.resolve(__dirname, 'assets');
const pathToTemplate = path.resolve(__dirname, 'template.html');

async function createFolder(folderPath, folderName) {
  const fullPath = folderName
    ? path.resolve(folderPath, folderName)
    : folderPath;

  return await fsPromises.mkdir(fullPath, { recursive: true });
}

async function createFile(filePath, fileName) {
  const fullPath = fileName ? path.resolve(filePath, fileName) : filePath;

  return await fsPromises.writeFile(fullPath, '');
}

async function copyFile(srcFilePath, distFilePath) {
  return await fsPromises.copyFile(srcFilePath, distFilePath);
}

function readFiles(srcFolderPath) {
  fs.readdir(
    srcFolderPath,
    {
      withFileTypes: true,
    },
    (err, files) => {
      if (err) console.log(err.message);
      files.forEach((file) => {
        let fullPathToFile = path.resolve(srcFolderPath, file.name);
        if (file.isDirectory()) {
          const fullNewDirectoryPath = path.resolve(
            getNewFullFilePath(srcFolderPath, 'assets'),
            file.name,
          );
          createFolder(fullNewDirectoryPath);
          readFiles(fullPathToFile);
        } else if (file.isFile()) {
          const fullNewFilePath = getNewFullFilePath(fullPathToFile, 'assets');
          copyFile(fullPathToFile, fullNewFilePath);
        }
      });
    },
  );
}

function getNewFullFilePath(fullFilePath, lastFolderName) {
  const pathArray = fullFilePath.split('\\').reverse();
  const result = [];

  for (let i = 0; i < pathArray.length; i++) {
    if (pathArray[i] !== lastFolderName) {
      result.push(pathArray[i]);
    } else {
      break;
    }
  }
  return path.resolve(
    distFolderPath,
    lastFolderName,
    result.reverse().join('\\'),
  );
}

function createReadableStream(filePath) {
  return fs.createReadStream(filePath, 'utf-8');
}

function copyData(directoryPath, file) {
  const srcFilePath = path.resolve(directoryPath, file.name);
  const readStream = createReadableStream(srcFilePath);
  let result = '\n';

  readStream.on('data', (chunk) => {
    result += chunk;
  });

  readStream.on('end', () => {
    fs.appendFile(newCssPath, result.toString(), (err) => {
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

function getHTMLCode(pathToTemplate, newHtmlPath) {
  copyFile(pathToTemplate, newHtmlPath).then(() => {
    const readStream = createReadableStream(newHtmlPath);
    let data = '';
    readStream.on('data', (chunk) => (data += chunk));
    readStream.on('end', () => {
      separateTemplates(data);
    });
  });
}

function separateTemplates(str) {
  const regex = /{{[a-zA-z]+}}/gm;
  let newHtml = str;
  [...str.matchAll(regex)].forEach((template) => {
    const templateName = template[0].slice(2, -2);
    const pathToComponent = path.resolve(
      componentsFolderPath,
      templateName + '.html',
    );
    let componentCode = '';
    const readStream = createReadableStream(pathToComponent);
    readStream.on('data', (chunk) => (componentCode += chunk));
    readStream.on('end', () => {
      newHtml = newHtml.replaceAll(template[0], '\n' + componentCode + '\n');
      const writeStream = createWriteStream(newHtmlPath, 'utf-8');
      writeStream.write(newHtml);
    });
  });
}

function deleteFiles(pathDir) {
  return new Promise((res) => {
    fsPromises
      .rm(pathDir, { recursive: true })
      .then(() => res('done'))
      .catch((err) => console.log(err.message));
  });
}
function build() {
  const assets = 'assets';
  fs.stat(distFolderPath, (err) => {
    if (err) {
      createFolder(distFolderPath)
        .then(() => createFolder(newAssetsPath))
        .then(() => createFile(newHtmlPath))
        .then(() => createFile(newCssPath))
        .then(() => readFiles(assetsFolderPath, assets))
        .then(() => selectCssFiles(stylesFolderPath, copyData))
        .then(() => getHTMLCode(pathToTemplate, newHtmlPath))
        .catch((err) => console.log('Error, line 236 %%%%%%%%%% ' + err));
    } else {
      deleteFiles(distFolderPath)
        .then(() => createFolder(distFolderPath))
        .then(() => createFolder(newAssetsPath))
        .then(() => createFile(newHtmlPath))
        .then(() => createFile(newCssPath))
        .then(() => readFiles(assetsFolderPath, assets))
        .then(() => selectCssFiles(stylesFolderPath, copyData))
        .then(() => getHTMLCode(pathToTemplate, newHtmlPath))
        .catch((err) => console.log('Error, line 236 %%%%%%%%%% ' + err));
    }
  });
}
build();
