const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Build CommonJS
console.log('Building CommonJS...');
execSync('tsc', { stdio: 'inherit' });

// Rename .js files to .cjs temporarily, build ESM, then restore
const distFiles = fs.readdirSync('dist');
const jsFiles = distFiles.filter(f => f.endsWith('.js') && !f.endsWith('.d.ts'));

// Backup CommonJS files
jsFiles.forEach(file => {
  const filePath = path.join('dist', file);
  const backupPath = path.join('dist', file.replace('.js', '.cjs.tmp'));
  fs.copyFileSync(filePath, backupPath);
});

// Build ESM
console.log('Building ESM...');
execSync('tsc --project tsconfig.esm.json', { stdio: 'inherit' });

// Rename ESM files to .esm.js
jsFiles.forEach(file => {
  const esmPath = path.join('dist', file);
  const esmBackupPath = path.join('dist', file.replace('.js', '.cjs.tmp'));
  
  if (fs.existsSync(esmPath) && fs.existsSync(esmBackupPath)) {
    // Rename ESM to .esm.js
    fs.renameSync(esmPath, path.join('dist', file.replace('.js', '.esm.js')));
    // Restore CommonJS
    fs.renameSync(esmBackupPath, esmPath);
  }
});

console.log('Build complete!');

