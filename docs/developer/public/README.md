---
layout: default
title: Developer Documentation
---

# Developer Documentation

Welcome to the Obsidian Kadi4Mat Sync Plugin developer documentation.

## Quick Links

- **[Project Roadmap](ROADMAP.md)** - Current status, planned features, and version history
- **[Known Issues](KNOWN-ISSUES.md)** - Bugs, limitations, and areas for improvement
- **[User Guide](../../user/)** - Installation and usage
- **[GitHub Repository](https://github.com/fcskit/obsidian-kadi4mat-sync)** - Source code
- **[Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)** - Obsidian API reference

## Project Overview

The Obsidian Kadi4Mat Sync Plugin enables synchronization of Obsidian notes with Kadi4Mat research data repository. Key features:

- Metadata extraction from YAML frontmatter
- Bidirectional sync (create and update records)
- License selection with fuzzy search
- Unit-aware data conversion
- Debug logging and error handling

## Architecture

### Project Structure

```
obsidian-kadi4mat-sync/
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── settings/         # Plugin settings
│   ├── core/             # Sync engine
│   ├── ui/               # User interface (modals)
│   └── utils/            # Utilities (frontmatter, metadata)
├── test-vault/           # Test Obsidian vault
├── docs/                 # Documentation
└── manifest.json         # Plugin manifest
```

### Key Components

**SyncEngine** (`src/core/SyncEngine.ts`)
- Handles record creation and updates
- Converts frontmatter to Kadi4Mat extras
- Updates note frontmatter with sync results

**SyncModal** (`src/ui/SyncModal.ts`)
- User interface for sync configuration
- Title, state, visibility, license selection
- Debug logging and preview

**LicenseSelectionModal** (`src/ui/LicenseSelectionModal.ts`)
- Fuzzy search modal for license selection
- 80+ SPDX licenses from kadi4mat-client
- Prevents invalid license submissions

**Frontmatter Utils** (`src/utils/frontmatter.ts`)
- Extract Kadi4Mat fields from frontmatter
- Filter metadata (remove Kadi4Mat-specific fields)
- Add context information

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Obsidian (for testing)
- TypeScript 4.9+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/fcskit/obsidian-kadi4mat-sync.git
cd obsidian-kadi4mat-sync

# Install dependencies
npm install

# Build for development
npm run dev
```

### Development Workflow

1. **Build to dev vault**: `npm run dev`
   - Builds plugin in production mode
   - Copies to `../obsidian-dev-vault/.obsidian/plugins/`
   - Reload Obsidian to see changes

2. **Make changes** in `src/`

3. **Rebuild**: `npm run dev`

4. **Reload plugin** in Obsidian (Settings → Community Plugins → Reload)

### Project Dependencies

- **kadi4mat-client** - API client library
- **Obsidian API** - Plugin development framework
- **TypeScript** - Type-safe development
- **ESBuild** - Fast bundler

## Key Features Implementation

### Metadata Conversion

Frontmatter is converted to Kadi4Mat extras using `jsonToExtras()`:

```typescript
import { jsonToExtras } from 'kadi4mat-client';

const extras = jsonToExtras({
  temperature: { value: 800, unit: '°C' },  // → int with unit
  sample: { name: 'A', type: 'compound' },  // → nested dict
  tags: ['TGA', 'analysis']                 // → list
});
```

### License Management

Uses kadi4mat-client's license data:

```typescript
import { getCommonLicenses, KADI_LICENSES } from 'kadi4mat-client';

// Quick access dropdown
const common = getCommonLicenses();  // 13 most common

// Full browser modal
const modal = new LicenseSelectionModal(app, (license) => {
  this.license = license.id;  // e.g., "MIT", "CC-BY-4.0"
});
```

### CORS Handling

Obsidian runs in Electron which has CORS restrictions. The plugin uses Obsidian's `requestUrl()` API:

```typescript
import { requestUrl } from 'obsidian';

// Fetch polyfill that works in Obsidian
const response = await requestUrl({
  url: 'https://kadi.iam.kit.edu/api/records',
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data)
});
```

## Contributing

### Development Guidelines

1. **Follow TypeScript strict mode** - No `any` types unless necessary
2. **Use Obsidian's UI components** - `Modal`, `Setting`, `Notice`, etc.
3. **Add debug logging** - Help users troubleshoot issues
4. **Test in real Obsidian vault** - Use test-vault for testing
5. **Document changes** - Update docs and comments

### Adding New Features

**Example: Adding a new sync option**

1. Add to plugin settings (`src/settings/settings.ts`)
2. Add UI control in `SyncModal` or settings tab
3. Use in `SyncEngine` when syncing
4. Test in development vault
5. Document in user guide

### Testing

Manual testing in Obsidian:

1. Build: `npm run dev`
2. Open test vault in Obsidian
3. Enable plugin
4. Test sync with various note formats
5. Check debug logs
6. Verify records in Kadi4Mat

## Build System

### ESBuild Configuration

The plugin uses ESBuild for fast bundling:

```javascript
// esbuild.config.mjs
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],  // Provided by Obsidian
  platform: 'browser',
  target: 'es2018',
  format: 'cjs',
  outfile: 'main.js'
});
```

### Build Scripts

- `npm run dev` - Build and copy to dev vault
- `npm run build` - Production build
- Asset copying handled by `copy-assets.mjs`

## Common Issues

### State Dropdown Blank
If the state dropdown appears blank, ensure the dropdown setup uses chained methods:
```typescript
.addDropdown(dropdown => dropdown
  .addOption('active', 'Active')
  .setValue(this.state)
  .onChange(...))
```

### CORS Errors
Always use `requestUrl()` from Obsidian API, never native `fetch()`.

### Metadata Not Syncing
Check that fields aren't in the Kadi4Mat reserved list (kadi_*, tags, title, etc.).

## Release Process

1. Update version in `manifest.json` and `versions.json`
2. Update CHANGELOG
3. Build: `npm run build`
4. Test thoroughly
5. Create GitHub release with `main.js`, `manifest.json`, `styles.css`
6. Update documentation

## Resources

- **[Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)** - Official API docs
- **[Obsidian Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)** - Plugin development guide
- **[kadi4mat-client](https://github.com/fcskit/kadi4mat-client)** - API client library
- **[Kadi4Mat API](https://kadi.iam.kit.edu/api/docs/)** - Kadi4Mat REST API

## Contact

- **Issues:** [GitHub Issues](https://github.com/fcskit/obsidian-kadi4mat-sync/issues)
- **Discussions:** [GitHub Discussions](https://github.com/fcskit/obsidian-kadi4mat-sync/discussions)
