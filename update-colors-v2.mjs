import fs from 'fs';
import path from 'path';

const srcPath = 'C:\\Users\\Ana Claudia\\Documents\\meupdv\\meu-pdv\\src';

const replacements = [
  ['#00D4FF', '#4DD0E1'],
  ['#00E676', '#81C784'],
  ['#C6FF00', '#AED581'],
  ['#FFB300', '#FFB74D'],
  ['#FF6B6B', '#E57373'],
  ['#121212', '#0A0A0A'],
  ['#1E1E1E', '#141414'],
  ['#2A2A2A', '#1F1F1F'],
  ['#333333', '#2A2A2A'],
  ['#00D4FF'.toLowerCase(), '#4DD0E1'],
  ['#00E676'.toLowerCase(), '#81C784'],
  ['rgba(0,212,255,', 'rgba(77,208,225,'],
  ['rgba(0,230,118,', 'rgba(129,199,132,'],
  ['rgba(198,255,0,', 'rgba(174,213,129,'],
  ['rgba(0,212,255,', 'rgba(77,208,225,']
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
console.log('Color replacement v2 complete!');
