# Build System Documentation

## Overview

This plugin uses a consolidated build system that supports both **development** and **production** builds, with a shared development vault for testing multiple plugins together.

## Directory Structure

```
~/Documents/GitHub/
├── obsidian-eln-plugin/          # ELN plugin repository
├── obsidian-kadi4mat-sync/       # Sync plugin repository (this repo)
├── kadi4mat-client/              # Client library
└── obsidian-dev-vault/           # SHARED development vault (gitignored)
    ├── .obsidian/
    │   └── plugins/
    │       ├── hot-reload/              # Auto-reload on file changes
    │       ├── obsidian-eln/            # ELN plugin (dev builds)
    │       └── obsidian-kadi4mat-sync/  # Sync plugin (dev builds)
    ├── Experiments/
    ├── Projects/
    └── ...test notes...
```

## Build Modes

### Development Mode (`npm run dev`)

**Purpose:** Quick builds for development and testing

**Target:** `../obsidian-dev-vault/.obsidian/plugins/obsidian-kadi4mat-sync/`

**Features:**
- Builds to shared development vault
- Minified (fast build)
- Works with hot-reload plugin
- Both ELN and Sync plugins can be tested together

**Usage:**
```bash
cd obsidian-kadi4mat-sync
npm run dev
```

**Output:**
```
🔨 Building for PRODUCTION
📂 Target: ../obsidian-dev-vault/.obsidian/plugins/obsidian-kadi4mat-sync

📦 Copying assets to ../obsidian-dev-vault/.obsidian/plugins/obsidian-kadi4mat-sync...
✓ Copied manifest.json
✅ Asset copy complete
```

### Production Mode (`npm run build`)

**Purpose:** Full TypeScript-checked builds for releases

**Target:** `./test-vault/.obsidian/plugins/obsidian-kadi4mat-sync/`

**Features:**
- TypeScript type checking
- Minified output
- No source maps
- Builds to local test-vault for release preparation

**Usage:**
```bash
npm run build
```

### Fast Build Mode (`npm run build-fast`)

**Purpose:** Quick production builds without TypeScript checking

**Target:** `./test-vault/.obsidian/plugins/obsidian-kadi4mat-sync/`

**Usage:**
```bash
npm run build-fast
```

## NPM Scripts Reference

| Script | Purpose | Target Vault | TypeScript Check |
|--------|---------|--------------|------------------|
| `npm run dev` | Development build | `../obsidian-dev-vault` | No |
| `npm run build` | Production build | `./test-vault` | Yes |
| `npm run build-fast` | Fast production build | `./test-vault` | No |
| `npm run release` | Build + create release package | `./test-vault` | Yes |
| `npm run lint` | Run ESLint | N/A | N/A |
| `npm run lint:fix` | Fix ESLint issues | N/A | N/A |

## Development Workflow

### Setting Up Your Environment

1. **Clone repositories:**
   ```bash
   cd ~/Documents/GitHub
   git clone [obsidian-eln-plugin-repo]
   git clone [obsidian-kadi4mat-sync-repo]
   git clone [kadi4mat-client-repo]
   ```

2. **The shared dev vault should already exist** at `~/Documents/GitHub/obsidian-dev-vault/`

3. **Install dependencies:**
   ```bash
   cd obsidian-kadi4mat-sync
   npm install
   ```

4. **Build plugin to dev vault:**
   ```bash
   npm run dev
   ```

5. **Open vault in Obsidian:**
   - Open Obsidian
   - File → Open Vault → `obsidian-dev-vault`
   - Settings → Community plugins → Enable both plugins

### Daily Development

**Terminal 1 - ELN Plugin (if testing together):**
```bash
cd ~/Documents/GitHub/obsidian-eln-plugin
npm run dev  # Run after making changes
```

**Terminal 2 - Sync Plugin:**
```bash
cd ~/Documents/GitHub/obsidian-kadi4mat-sync
npm run dev  # Run after making changes
```

**Obsidian:**
- Open `obsidian-dev-vault`
- Hot-reload plugin will automatically reload plugins when `main.js` changes
- Test your changes immediately

### Testing Both Plugins Together

1. **Create an ELN note** in the dev vault using the ELN plugin
2. **Add metadata** (nested properties, units, etc.)
3. **Use Sync plugin** to push to Kadi4Mat
4. **Verify** the sync modal appears
5. **Check** that metadata converts correctly

## Hot-Reload Plugin

The shared dev vault includes the [hot-reload plugin](https://github.com/pjeby/hot-reload) which automatically reloads plugins when their files change.

**What it watches:**
- `obsidian-eln/main.js`
- `obsidian-eln/styles.css`
- `obsidian-kadi4mat-sync/main.js`
- `obsidian-kadi4mat-sync/manifest.json`

**Benefits:**
- No manual plugin reload needed
- Instant feedback on code changes
- Faster development cycle

## Build Script Details

### esbuild.config.mjs

**Purpose:** Main build configuration using ESBuild

**Key Features:**
- Environment variable support (`DEV_VAULT`)
- Automatic vault selection (dev vs production)
- Source maps for development
- Minification for production
- External dependencies (Obsidian, Electron, CodeMirror)

**Configuration Logic:**
```javascript
const DEV_VAULT = "../obsidian-dev-vault";
const PROD_VAULT = "./test-vault";
const targetVault = process.env.DEV_VAULT || (prod ? PROD_VAULT : DEV_VAULT);
```

### copy-assets.mjs

**Purpose:** Copy manifest and styles to vault

**Files Copied:**
- `manifest.json` → Always
- `styles.css` → If exists (not used in this plugin yet)
- `data.json` → If exists (plugin settings)

### build-release.mjs

**Purpose:** Create release package for GitHub

**Process:**
1. Validates version numbers match (package.json ↔ manifest.json)
2. Creates `release/` directory
3. Copies: `manifest.json`, `main.js`, (`styles.css` if exists)
4. Creates zip file: `obsidian-kadi4mat-sync-{version}.zip`

**Usage:**
```bash
npm run release
```

**Output:**
```
🚀 Building release for version X.X.X...
📋 Copying files to release directory...
✓ Copied ./manifest.json
✓ Copied ./test-vault/.obsidian/plugins/obsidian-kadi4mat-sync/main.js

📦 Creating zip file...
✅ Created obsidian-kadi4mat-sync-X.X.X.zip

✨ Release X.X.X is ready!

📦 Files in release/:
   - manifest.json
   - main.js

📮 To publish:
   1. Create a new release on GitHub with tag "X.X.X"
   2. Upload obsidian-kadi4mat-sync-X.X.X.zip
   3. Upload main.js, manifest.json
```

## Version Management

### Updating Version Numbers

Use the built-in version script:

```bash
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
```

This automatically:
- Updates `package.json`
- Updates `manifest.json`
- Updates `versions.json`
- Creates git commit

## File Size Reference

Typical build sizes:
- `main.js`: ~33 KB (minified)
- `manifest.json`: ~300 bytes
- Total plugin size: ~33 KB

## Troubleshooting

### Plugin Not Loading in Dev Vault

**Check:**
1. Files exist in `obsidian-dev-vault/.obsidian/plugins/obsidian-kadi4mat-sync/`
2. `manifest.json` is present
3. Plugin is enabled in Obsidian settings

**Fix:**
```bash
cd obsidian-kadi4mat-sync
npm run dev
# Then restart Obsidian or reload plugins
```

### Hot-Reload Not Working

**Check:**
1. Hot-reload plugin is installed and enabled
2. Files are in the correct location
3. File permissions are correct

**Fix:**
```bash
# Rebuild to ensure fresh files
npm run dev

# In Obsidian: Ctrl+P → "Reload app without saving"
```

### Build Errors

**"Cannot find module":**
- Run `npm install` to ensure dependencies are installed

**"TypeScript errors":**
- Use `npm run build-fast` to skip TypeScript checks temporarily
- Fix TypeScript errors before creating releases

**"EACCES permission denied":**
- Check file permissions on target vault directory
- Ensure vault is not open in multiple Obsidian instances

### Version Mismatch Errors

If `npm run release` fails with version mismatch:

```bash
# Check versions
cat package.json | grep version
cat manifest.json | grep version

# Fix with version script
npm version X.X.X  # Use desired version number
```

## Advanced: Custom Vault Location

To use a different dev vault location:

```bash
DEV_VAULT=/path/to/custom/vault npm run dev
```

Or set permanently in your shell:

```bash
# In ~/.zshrc or ~/.bashrc
export DEV_VAULT="$HOME/CustomObsidianVault"
```

## Integration with ELN Plugin

Both plugins use the same build system architecture:

**ELN Plugin:**
- `npm run dev` → Builds to `../obsidian-dev-vault/.obsidian/plugins/obsidian-eln/`
- Includes CSS compilation step
- Larger build size (~500 KB)

**Sync Plugin:**
- `npm run dev` → Builds to `../obsidian-dev-vault/.obsidian/plugins/obsidian-kadi4mat-sync/`
- No CSS (uses Obsidian's default styles)
- Smaller build size (~33 KB)

**Shared Vault Benefits:**
- Test plugin interaction
- Realistic development environment
- Single Obsidian instance for testing
- Hot-reload works for both plugins

## Git Workflow

### What's Ignored

Both plugins ignore:
- `../obsidian-dev-vault/` - Shared dev vault
- `release/` - Build artifacts
- `*.zip` - Distribution packages
- `test-vault/` - Local test vault (sync plugin)

### What's Versioned

Both plugins version:
- Source code (`src/`)
- Build scripts (`*.mjs`)
- Configuration (`package.json`, `manifest.json`, `tsconfig.json`)
- Documentation

**Note:** The ELN plugin includes `test-vault/` in git (contains example notes), but the sync plugin does not.

## CI/CD Considerations

For future GitHub Actions integration:

```yaml
# .github/workflows/build.yml
- name: Build plugin
  run: npm run build

- name: Create release
  if: startsWith(github.ref, 'refs/tags/')
  run: npm run release
```

The build system is designed to work in CI environments without modification.

## Related Documentation

- [Sync Modal Documentation](./SYNC-MODAL-DOCS.md) - User guide for sync modal
- [Sync Modal Implementation](./SYNC-MODAL-IMPLEMENTATION.md) - Technical details
- [Build System Strategy](./BUILD-SYSTEM-STRATEGY.md) - Architecture design decisions
- [Main README](./README.md) - Plugin overview and setup

## Support

If you encounter build system issues:

1. Check this documentation first
2. Verify your environment matches the setup instructions
3. Try `npm install` and `npm run dev` again
4. Check GitHub issues for similar problems
