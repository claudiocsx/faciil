import fs from 'fs';
import path from 'path';

const srcPath = 'C:\\Users\\Ana Claudia\\Documents\\meupdv\\meu-pdv\\src';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const glowPatterns = [
    /boxShadow:\s*['"](.*?)['"]/g,
    /textShadow:\s*['"](.*?)['"]/g,
    /style=\{\{.*?boxShadow.*?\}\}/g,
    /style=\{\{.*?textShadow.*?\}\}/g,
  ];

  glowPatterns.forEach(regex => {
    if (regex.test(content)) {
      content = content.replace(regex, '');
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
    } else if (file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

walkDir(srcPath);
console.log('Glow removal complete!');
