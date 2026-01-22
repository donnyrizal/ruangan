const fs = require("fs-extra");
const path = require("path");

const srcDir = "./";
const outDir = "./dist";
const ignoreList = [
  "node_modules",
  "dist",
  ".git",
  "package.json",
  "package-lock.json",
  "build.js",
  "script.js",
  "sidebar.js",
];

async function build() {
  console.log("🧹 Cleaning up old build directory...");
  await fs.emptyDir(outDir);
  console.log(
    "🔄 Starting main build process (creating clean URLs for HTML files)...",
  );
  const items = fs.readdirSync(srcDir);
  items.forEach((item) => {
    if (ignoreList.includes(item)) return;

    const fullPath = path.join(srcDir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fs.copySync(fullPath, path.join(outDir, item));
    } else if (
      item.endsWith(".html") &&
      item !== "index.html" &&
      item !== "404.html"
    ) {
      const name = path.parse(item).name;
      fs.ensureDirSync(path.join(outDir, name));
      fs.copySync(fullPath, path.join(outDir, name, "index.html"));
      console.log(`   Cleaned: ${item} -> ${name}/index.html`);
    } else {
      fs.copySync(fullPath, path.join(outDir, item));
    }
  });
  console.log(
    "🔗 Copying specific JS files to ALL sub-directories...",
  );

  const filesToDuplicate = ["script.js", "sidebar.js"];
  
  // AUTOMATICALLY find all folders in 'dist' that are not 'assets' or hidden
  const targetFolders = fs.readdirSync(outDir).filter(f => {
    const fullPath = path.join(outDir, f);
    return fs.statSync(fullPath).isDirectory() && f !== 'assets';
  });

  filesToDuplicate.forEach((file) => {
    const sourceFile = path.join(srcDir, file);
    
    // Check if source file exists before copying
    if (fs.existsSync(sourceFile)) {
        targetFolders.forEach((folder) => {
          const targetFile = path.join(outDir, folder, file);
          fs.copySync(sourceFile, targetFile);
          console.log(`   Copied ${file} to ${folder}/`);
        });
    }
  });

  console.log("✅ Build complete!");
}

build();
