import fs from 'fs';
import path from 'path';

const srcPath = 'C:\\Users\\Ana Claudia\\Documents\\meupdv\\meu-pdv\\src';

const replacements = [
  ['#4DD0E1', '#3B8B9'],
  ['#81C784', '#5A9E5A'],
  ['#AED581', '#8AA82E'],
  ['#FFB74D', '#B8860B'],
  ['#E57373', '#B55555'],
  ['#0A0A0A', '#050505'],
  ['#141414', '#0A0A0A'],
  ['#1F1F1F', '#141414'],
  ['#2A2A2A', '#1F1F1F'],
  ['rgba(77,208,225,', 'rgba(59,139,185,'],
  ['rgba(129,199,132,', 'rgba(90,158,90,'],
  ['rgba(174,213,129,', 'rgba(138,168,46,']
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
console.log('Color replacement v3 complete!');
