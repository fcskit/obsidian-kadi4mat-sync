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

const releaseDir = join(__dirname, "release");

// Clean and create release directory
if (existsSync(releaseDir)) {
    console.log("🗑️  Cleaning old release directory...");
    execSync(`rm -rf ${releaseDir}`);
}
mkdirSync(releaseDir, { recursive: true });

console.log("📋 Copying files to release directory...");

// Files to copy
const filesToCopy = [
    { source: "./manifest.json", dest: join(releaseDir, "manifest.json") },
    { source: "./test-vault/.obsidian/plugins/obsidian-kadi4mat-sync/main.js", 
      dest: join(releaseDir, "main.js") }
];

// Add styles.css if it exists
if (existsSync("./styles.css")) {
    filesToCopy.push({ 
        source: "./styles.css", 
        dest: join(releaseDir, "styles.css") 
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
process.chdir(releaseDir);
const zipName = `obsidian-kadi4mat-sync-${version}.zip`;
try {
    execSync(`zip -r "../${zipName}" .`, { stdio: 'inherit' });
    console.log(`✅ Created ${zipName}`);
} catch (error) {
    console.error("❌ Error creating zip:", error.message);
    process.exit(1);
}

console.log(`\n✨ Release ${version} is ready!`);
console.log(`\n📦 Files in release/:`);
console.log(`   - manifest.json`);
console.log(`   - main.js`);
if (existsSync(join(releaseDir, "styles.css"))) {
    console.log(`   - styles.css`);
}
console.log(`\n📮 To publish:`);
console.log(`   1. Create a new release on GitHub with tag "${version}"`);
console.log(`   2. Upload ${zipName}`);
console.log(`   3. Upload main.js, manifest.json${existsSync(join(releaseDir, "styles.css")) ? ", styles.css" : ""}`);
console.log();
