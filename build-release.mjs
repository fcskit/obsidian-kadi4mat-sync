#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));
const manifestJson = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));
const version = packageJson.version;

console.log(`\n🚀 Building release for version ${version}...`);

// Validate version matches
if (manifestJson.version !== version) {
    console.error(`❌ Error: Version mismatch!`);
    console.error(`   package.json: ${version}`);
    console.error(`   manifest.json: ${manifestJson.version}`);
    console.error(`\nPlease run: npm run version ${version}`);
    process.exit(1);
}

// Step 1: Build the plugin
console.log("\n📦 Building plugin...");
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log("✓ Build completed successfully");
} catch (error) {
    console.error("✗ Build failed:", error.message);
    process.exit(1);
}

const releaseDir = join(__dirname, "release");
const versionDir = join(releaseDir, version);

// Create release directory structure
if (!existsSync(releaseDir)) {
    mkdirSync(releaseDir, { recursive: true });
}

if (!existsSync(versionDir)) {
    mkdirSync(versionDir, { recursive: true });
    console.log(`✓ Created release directory: release/${version}/`);
} else {
    console.log(`⚠️  Release directory already exists: release/${version}/`);
    console.log(`   Files will be overwritten.`);
}

console.log("\n📋 Copying files to release directory...");

// Files to copy
const filesToCopy = [
    { source: "./manifest.json", dest: join(versionDir, "manifest.json") },
    { source: "./test-vault/.obsidian/plugins/obsidian-kadi4mat-sync/main.js", 
      dest: join(versionDir, "main.js") }
];

// Add styles.css if it exists
if (existsSync("./styles.css")) {
    filesToCopy.push({ 
        source: "./styles.css", 
        dest: join(versionDir, "styles.css") 
    });
}

for (const file of filesToCopy) {
    try {
        copyFileSync(file.source, file.dest);
        console.log(`✓ Copied ${file.source}`);
    } catch (error) {
        console.error(`❌ Error copying ${file.source}:`, error.message);
        process.exit(1);
    }
}

// Create zip file
console.log("\n📦 Creating zip file...");
const zipName = `obsidian-kadi4mat-sync-${version}.zip`;

try {
    // Change to version directory and create zip
    const currentDir = process.cwd();
    process.chdir(versionDir);
    execSync(`zip -r "../${zipName}" .`, { stdio: 'pipe' });
    process.chdir(currentDir);
    console.log(`✓ Created release/${zipName}`);
} catch (error) {
    console.error("⚠️  Error creating zip:", error.message);
    console.log("You can manually zip the contents of release/" + version + "/ directory");
}

console.log(`\n✅ Release ${version} is ready!`);
console.log(`\n📦 Release structure:`);
console.log(`   release/`);
console.log(`   ├── ${version}/`);
console.log(`   │   ├── manifest.json`);
console.log(`   │   ├── main.js`);
if (existsSync(join(versionDir, "styles.css"))) {
    console.log(`   │   └── styles.css`);
}
console.log(`   └── ${zipName}`);
console.log(`\n� Next steps:`);
console.log(`   1. Go to https://github.com/fcskit/obsidian-kadi4mat-sync/releases/new`);
console.log(`   2. Choose tag: v${version}`);
console.log(`   3. Upload release/${zipName}`);
console.log(`   4. Or upload individual files from release/${version}/`);
console.log(`\n💡 For BRAT users: They can install with: fcskit/obsidian-kadi4mat-sync`);
console.log();
