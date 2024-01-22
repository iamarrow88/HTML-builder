const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const pathToFolder = path.join(__dirname, 'files');
const newFolderName = 'files-copy';
const pathToNewFolder = path.join(__dirname, newFolderName);
async function createDir() {
  return await fsPromises.mkdir(pathToNewFolder, { recursive: true });
}

function readFileNames() {
  fs.readdir(pathToFolder, (err, fileNames) => {
    if (err) console.log(err.message);
    fileNames.forEach((fileName) => copyFile(fileName));
  });
}

async function copyFile(fileName) {
  const pathToFile = path.resolve(pathToFolder, fileName);
  const pathToNewFile = path.resolve(pathToNewFolder, fileName);
  return await fsPromises.copyFile(pathToFile, pathToNewFile);
}

function deleteFiles(pathDir) {
  fs.readdir(
    pathDir,
    {
      withFileTypes: true,
    },
    (err, files) => {
      console.log(files);
      if (err) console.log(err);
      files.forEach((file) => {
        if (file.isDirectory()) {
          console.log('folder');
          let newPath;
          if (newPath) {
            newPath = path.resolve(newPath, file.name);
          } else {
            newPath = path.resolve(pathDir, file.name);
          }
          deleteFiles(newPath);
        }
        if (file.isFile()) {
          console.log(file.name);
          console.log(path.resolve(pathDir, file.name));
          fs.rm(path.resolve(pathDir, file.name), (err) => {
            if (err) console.log(err);
          });
        }
      });
    },
  );
}

function copyDir() {
  deleteFiles(pathToNewFolder);
  createDir().then(() => {
    readFileNames();
  });
}
copyDir();
