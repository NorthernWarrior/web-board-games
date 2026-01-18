const fs = require('fs');
const path = require('path');

const envFiles = [
  path.join(__dirname, 'src', 'environments', 'environment.ts'),
  path.join(__dirname, 'src', 'environments', 'environment.prod.ts')
];

const version = process.env.VERSION || process.env.npm_package_version || 'dev';

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/version: '.*'/, `version: '${version}'`);
    fs.writeFileSync(file, content);
    console.log(`Injected version ${version} into ${file}`);
  }
}
