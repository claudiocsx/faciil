const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\Ana Claudia\\Documents\\meupdv\\meu-pdv\\src';

const replacements = [
  ['#39FF14', '#00E676'],
  ['#1DF2FF', '#00D4FF'],
  ['#ADFF2F', '#C6FF00'],
  ['#0F0F0F', '#121212'],
  ['#1A1A1A', '#1E1E1E'],
  ['rgba(57,255,20,', 'rgba(0,230,118,'],
  ['rgba(29,242,255,', 'rgba(0,212,255,'],
  ['rgba(173,255,47,', 'rgba(198,255,0,']
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(([oldVal, newVal]) => {
    if (content.includes(oldVal)) {
      content = content.split(oldVal).join(newVal);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.css')) {
      processFile(fullPath);
    }
  });
}

walkDir(srcPath);
console.log('Color replacement complete!');
