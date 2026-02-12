# Consolidated Build System Strategy

## Problem Statement

We have two plugins that need to work together during development:
1. **obsidian-eln-plugin** - Creates ELN notes with structured metadata
2. **obsidian-kadi4mat-sync** - Syncs notes to Kadi4Mat

Currently:
- `test-vault-dev` is inside the ELN plugin folder
- Build scripts are inconsistent between plugins
- No shared development environment
- Manual setup required for testing both plugins together

## Proposed Solution

### 1. Shared Test Vault Structure

Create a **shared test vault** outside both plugin repositories:

```
~/Documents/GitHub/
├── obsidian-eln-plugin/          # ELN plugin repo
├── obsidian-kadi4mat-sync/       # Sync plugin repo
├── kadi4mat-client/              # Client library
└── obsidian-dev-vault/           # SHARED test vault (gitignored or private repo)
    ├── .obsidian/
    │   ├── plugins/
    │   │   ├── obsidian-eln/           # ELN plugin files (symlink or copy)
    │   │   ├── obsidian-kadi4mat-sync/ # Sync plugin files (symlink or copy)
    │   │   └── hot-reload/             # Hot-reload plugin
    │   └── app.json
    ├── Experiments/
    ├── Projects/
    └── ...test notes...
```

**Benefits:**
- Both plugins can be tested together
- Realistic development environment
- No conflicts with git repositories
- Can be a separate private git repo if desired
- Matches real-world usage (vault with multiple plugins)

### 2. Build Script Architecture

Each plugin will have consistent build scripts:

#### Environment Variables

```javascript
// In esbuild.config.mjs
const DEV_VAULT = process.env.DEV_VAULT || "../obsidian-dev-vault";
const PROD_VAULT = "./test-vault";  // Public test vault for releases

const targetVault = prod ? PROD_VAULT : DEV_VAULT;
const pluginDir = `${targetVault}/.obsidian/plugins/[plugin-name]`;
```

#### Build Modes

**Development Mode** (`npm run dev`):
- Builds to `DEV_VAULT` (shared dev vault)
- Enables watch mode
- Includes source maps
- No minification
- Hot-reload compatible

**Production Mode** (`npm run build`):
- Builds to `PROD_VAULT` (public test-vault)
- Single build (no watch)
- No source maps
- Minified
- For releases

**Fast Build** (`npm run build-fast`):
- Like production but skips TypeScript checking
- Faster iteration during debugging

#### Script Structure

```json
{
  "scripts": {
    "dev": "node build-css.mjs && node esbuild.config.mjs && node copy-assets.mjs",
    "build": "node build-css.mjs && tsc -noEmit -skipLibCheck && node esbuild.config.mjs production && node copy-assets.mjs",
    "build-fast": "node build-css.mjs && node esbuild.config.mjs production && node copy-assets.mjs",
    "release": "npm run build && node build-release.mjs",
    "publish": "npm run release && node publish-release.mjs",
    "watch": "npm run dev -- --watch",
    "watch-css": "node watch-css.mjs"
  }
}
```

### 3. Implementation Plan

#### Phase 1: Create Shared Vault

1. **Create directory structure:**
   ```bash
   mkdir ~/Documents/GitHub/obsidian-dev-vault
   cd ~/Documents/GitHub/obsidian-dev-vault
   mkdir -p .obsidian/plugins
   ```

2. **Copy hot-reload plugin:**
   ```bash
   cp -r obsidian-eln-plugin/test-vault-dev/.obsidian/plugins/hot-reload \
         obsidian-dev-vault/.obsidian/plugins/
   ```

3. **Copy initial vault structure:**
   ```bash
   cp -r obsidian-eln-plugin/test-vault-dev/* obsidian-dev-vault/
   ```

4. **Create .gitignore (if not making it a git repo):**
   ```
   # All content is development only
   *
   
   # Except hot-reload plugin
   !.obsidian/plugins/hot-reload/
   ```

   **OR** make it a private git repo for version control

#### Phase 2: Update ELN Plugin Build Scripts

1. **Update `esbuild.config.mjs`:**
   - Add `DEV_VAULT` environment variable
   - Default to `../obsidian-dev-vault`
   - Use `PROD_VAULT` for production builds

2. **Update `copy-assets.mjs`:**
   - Use same vault selection logic

3. **Update `.gitignore`:**
   - Keep `test-vault-dev/` exclusion (can delete folder later)
   - Add note about new shared vault location

4. **Add `BUILD.md` documentation**

#### Phase 3: Update Sync Plugin Build Scripts

1. **Create build scripts matching ELN plugin:**
   - `build-css.mjs`
   - `copy-assets.mjs`
   - `build-release.mjs`
   - `watch-css.mjs`

2. **Update `esbuild.config.mjs`:**
   - Add dev/prod vault support
   - Configure plugin name: `obsidian-kadi4mat-sync`

3. **Update `package.json` scripts**

4. **Create `.gitignore` entry for dev vault**

#### Phase 4: Testing & Documentation

1. **Test development workflow:**
   ```bash
   # Terminal 1 - ELN plugin
   cd obsidian-eln-plugin
   npm run dev
   
   # Terminal 2 - Sync plugin
   cd obsidian-kadi4mat-sync
   npm run dev
   
   # Open Obsidian with obsidian-dev-vault
   ```

2. **Test hot-reload:**
   - Make changes to plugin code
   - Verify hot-reload triggers
   - Verify both plugins reload

3. **Test production build:**
   ```bash
   cd obsidian-eln-plugin
   npm run build
   # Should build to ./test-vault/
   ```

4. **Create documentation:**
   - `BUILD-SYSTEM.md` - Architecture overview
   - `DEVELOPMENT-WORKFLOW.md` - How to develop with shared vault
   - Update main README files

### 4. Detailed File Changes

#### `esbuild.config.mjs` (both plugins)

```javascript
import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/`;

const prod = process.argv[2] === "production";

// Vault configuration
const DEV_VAULT = process.env.DEV_VAULT || "../obsidian-dev-vault";
const PROD_VAULT = "./test-vault";
const PLUGIN_NAME = "obsidian-eln"; // or "obsidian-kadi4mat-sync"

const targetVault = prod ? PROD_VAULT : DEV_VAULT;
const pluginDir = `${targetVault}/.obsidian/plugins/${PLUGIN_NAME}`;

console.log(`Building for ${prod ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`Target: ${pluginDir}`);

const context = await esbuild.context({
    banner: { js: banner },
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        // ... rest of externals
        ...builtins
    ],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: `${pluginDir}/main.js`,
    minify: prod,
});

if (prod) {
    await context.rebuild();
    process.exit(0);
} else {
    await context.watch();
}
```

#### `copy-assets.mjs` (both plugins)

```javascript
import { copyFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const prod = process.argv[2] === "production";
const DEV_VAULT = process.env.DEV_VAULT || "../obsidian-dev-vault";
const PROD_VAULT = "./test-vault";
const PLUGIN_NAME = "obsidian-eln"; // or "obsidian-kadi4mat-sync"

const targetVault = prod ? PROD_VAULT : DEV_VAULT;
const pluginDir = `${targetVault}/.obsidian/plugins/${PLUGIN_NAME}`;

async function main() {
    console.log(`Copying assets to ${pluginDir}...`);
    
    // Ensure directory exists
    await mkdir(pluginDir, { recursive: true });

    // Copy files
    await copyFile("./styles.css", join(pluginDir, "styles.css"));
    await copyFile("./manifest.json", join(pluginDir, "manifest.json"));
    
    console.log("✓ Copied styles.css and manifest.json");
    
    // Optional: Copy data.json if it exists (for plugin settings)
    if (existsSync("./data.json")) {
        await copyFile("./data.json", join(pluginDir, "data.json"));
        console.log("✓ Copied data.json");
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
```

### 5. Environment Setup Instructions

#### For Developers

**Step 1: Clone repositories**
```bash
cd ~/Documents/GitHub
git clone [obsidian-eln-plugin-repo]
git clone [obsidian-kadi4mat-sync-repo]
git clone [kadi4mat-client-repo]
```

**Step 2: Create shared dev vault**
```bash
mkdir obsidian-dev-vault
cd obsidian-dev-vault
mkdir -p .obsidian/plugins
```

**Step 3: Install hot-reload plugin**
```bash
# Download from: https://github.com/pjeby/hot-reload
# Or copy from existing vault
cp -r ../obsidian-eln-plugin/test-vault-dev/.obsidian/plugins/hot-reload \
      .obsidian/plugins/
```

**Step 4: Open vault in Obsidian**
```bash
# File → Open Vault → obsidian-dev-vault
# Enable both plugins + hot-reload in settings
```

**Step 5: Start development**
```bash
# Terminal 1 - ELN plugin
cd obsidian-eln-plugin
npm install
npm run dev

# Terminal 2 - Sync plugin
cd obsidian-kadi4mat-sync
npm install
npm run dev
```

Now any changes will auto-reload in Obsidian!

### 6. Advantages of This Approach

1. **Clean Separation**
   - Dev vault separate from plugin code
   - No `.gitignore` complexity
   - Can version control dev vault separately

2. **Realistic Testing**
   - Both plugins installed together
   - Real-world plugin interactions
   - Shared vault state

3. **Hot-Reload**
   - Instant feedback on changes
   - No manual plugin reload
   - Faster development cycle

4. **Flexible Deployment**
   - Dev builds go to shared vault
   - Prod builds go to public test-vault
   - Easy to switch between modes

5. **Consistent Build System**
   - Same scripts for both plugins
   - Easy to understand and maintain
   - Clear dev vs prod distinction

### 7. Migration Path

**Option A: Keep test-vault-dev temporarily**
- Useful if you want to compare old vs new setup
- Can delete after confirming everything works

**Option B: Move test-vault-dev**
```bash
mv obsidian-eln-plugin/test-vault-dev ~/Documents/GitHub/obsidian-dev-vault
```

**Option C: Fresh start**
- Create new obsidian-dev-vault
- Copy only what you need
- Clean slate for development

### 8. Git Repository Options for Dev Vault

**Option 1: Gitignore (Current Approach)**
- Add `obsidian-dev-vault/` to global gitignore
- Keep it local only
- Simplest approach

**Option 2: Private Git Repository**
```bash
cd obsidian-dev-vault
git init
git remote add origin [private-repo-url]
```

Benefits:
- Version control for test notes
- Share dev environment with team
- Track vault evolution

**Option 3: Separate Organization**
- Create separate GitHub organization for dev resources
- Keep all dev vaults there
- Clear separation from production code

## Next Steps

1. **Review this strategy** - Confirm approach
2. **Create shared vault** - Set up directory structure
3. **Update ELN plugin** - Migrate build scripts
4. **Update Sync plugin** - Add build scripts
5. **Test workflow** - Verify hot-reload works
6. **Document** - Create BUILD-SYSTEM.md
7. **Clean up** - Remove old test-vault-dev if desired

## Questions to Decide

1. **Location of shared vault:**
   - `~/Documents/GitHub/obsidian-dev-vault` (proposed)
   - Or different location?

2. **Git repository for dev vault:**
   - Gitignore only?
   - Private git repo?
   - Separate organization?

3. **Migration strategy:**
   - Move existing test-vault-dev?
   - Start fresh?
   - Keep both temporarily?

4. **Plugin naming:**
   - Keep "obsidian-eln" and "obsidian-kadi4mat-sync"?
   - Or standardize names?

Would you like me to proceed with implementing this strategy?
