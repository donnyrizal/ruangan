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
  "README.md",
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
      let htmlContent = fs.readFileSync(fullPath, 'utf-8');
      htmlContent = htmlContent.replace(/src="\.\//g, 'src="../');
      htmlContent = htmlContent.replace(/href="\.\//g, 'href="../');
      fs.ensureDirSync(path.join(outDir, name));
      fs.writeFileSync(path.join(outDir, name, "index.html"), htmlContent);
      console.log(`   ✨ Processed & Cleaned: ${item} -> ${name}/index.html (Paths updated)`);
    } else {
      fs.copySync(fullPath, path.join(outDir, item));
    }
  });
  console.log("✅ Build complete! No duplicate files.");
}
build();