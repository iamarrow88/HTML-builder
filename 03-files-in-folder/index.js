const path = require('path');
const fs = require('fs');

const fullPath = path.join(__dirname, 'secret-folder');
let files;

fs.readdir(fullPath, (err, data) => {
  if (err) console.log(err.message);
  files = data;
  files.forEach((fileName) => {
    const filePath = path.join(fullPath, fileName);
    fs.stat(filePath, (err, data) => {
      if (err) console.log(err.message + 'line 15');
      if (!data.isDirectory()) {
        const stats = path.parse(filePath);
        let result =
          stats.name +
          ' - ' +
          stats.ext.slice(1) +
          ' - ' +
          data.size / 1000 +
          'kB';
        console.log(result);
      }
    });
  });
});
