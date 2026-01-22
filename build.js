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
  "README.md" 
];

async function build() {
  console.log("🧹 Cleaning up old build directory...");
  await fs.emptyDir(outDir);
  console.log("🔄 Starting build...");
  const items = fs.readdirSync(srcDir);
  items.forEach((item) => {
    if (ignoreList.includes(item)) return;
    const fullPath = path.join(srcDir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fs.copySync(fullPath, path.join(outDir, item));
    } else if (item.endsWith(".html") && item !== "index.html" && item !== "404.html") {
      const name = path.parse(item).name;
      fs.ensureDirSync(path.join(outDir, name));
      fs.copySync(fullPath, path.join(outDir, name, "index.html"));
      console.log(`   Cleaned: ${item} -> ${name}/index.html`);
    } else {
      fs.copySync(fullPath, path.join(outDir, item));
    }
  });
  console.log("✅ Build complete!");
}
build();