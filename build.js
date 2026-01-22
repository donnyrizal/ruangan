const fs = require('fs-extra'); // Install this: npm install fs-extra
const path = require('path');

const srcDir = './';
const outDir = './dist';

// Files/folders to ignore
const ignoreList = ['node_modules', 'dist', '.git', 'package.json', 'package-lock.json', 'build.js'];

async function build() {
    await fs.emptyDir(outDir);
    
    const items = fs.readdirSync(srcDir);
    
    items.forEach(item => {
        if (ignoreList.includes(item)) return;

        const fullPath = path.join(srcDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            fs.copySync(fullPath, path.join(outDir, item));
        } else if (item.endsWith('.html') && item !== 'index.html' && item !== '404.html') {
            // The Clean URL Magic: file.html -> file/index.html
            const name = path.parse(item).name;
            fs.ensureDirSync(path.join(outDir, name));
            fs.copySync(fullPath, path.join(outDir, name, 'index.html'));
        } else {
            fs.copySync(fullPath, path.join(outDir, item));
        }
    });
    
    // Create .nojekyll to ensure GitHub doesn't mess with folders
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    console.log('🚀 Build complete in /dist');
}

build();
