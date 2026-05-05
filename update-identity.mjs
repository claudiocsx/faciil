import fs from 'fs';
import path from 'path';

const srcPath = 'C:\\Users\\Ana Claudia\\Documents\\meupdv\\meu-pdv\\src';

const replacements = [
  ['#050505', '#FDFDFD'],
  ['#0A0A0A', '#FFFFFF'],
  ['#0F0F0F', '#F4F4F5'],
  ['#141414', '#F4F4F5'],
  ['#1A1A1A', '#FFFFFF'],
  ['#1F1F1F', '#F4F4F5'],
  ['#3B8B9', '#FFB347'],
  ['#5A9E5A', '#1A2238'],
  ['#8AA82E', '#FFB347'],
  ['#B8860B', '#FFB347'],
  ['#A0A0A0', '#1A2238'],
  ['#707070', '#4A5568'],
  ['#505050', '#71717A'],
  ['#4DD0E1', '#FFB347'],
  ['#81C784', '#1A2238'],
  ['#5A8A5A', '#1A2238'],
  ['#7A8A5A', '#FFB347'],
  ['#B55555', '#DC2626'],
  ['#E57373', '#DC2626'],
  ['#A05050', '#DC2626'],
  ['var(--color-bg-deep)', '#FDFDFD'],
  ['var(--color-bg-card)', '#FFFFFF'],
  ['var(--color-bg-elevated)', '#F4F4F5'],
  ['var(--color-border-glow)', 'rgba(0,0,0,0.04)'],
  ['var(--color-border-subtle)', 'rgba(0,0,0,0.08)'],
  ['var(--color-text-primary)', '#1A2238'],
  ['var(--color-text-secondary)', '#4A5568'],
  ['var(--color-text-dim)', '#71717A'],
  ['#00D4FF', '#FFB347'],
  ['#00E676', '#1A2238'],
  ['#C6FF00', '#FFB347'],
  ['#4DD0E1', '#FFB347'],
  ['#81C784', '#1A2238'],
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
console.log('Identity update complete!');
