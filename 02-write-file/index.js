const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

const fullPath = path.join(__dirname, 'text.txt');
fs.writeFile(fullPath, '', (err) => {
  if (err) console.log(err.message);
  console.log('\n**The file created**');
});

stdout.write('Hello! Please, type something.');
stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    console.log('Bye!');
    process.exit(0);
  } else {
    fs.appendFile(fullPath, data, (err) => {
      if (err) console.log(err.message);
      console.log('**written to the file**');
    });
  }
});

stdin.on('exit', () => console.log('Bye!'));
