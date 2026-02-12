# Obsidian Kadi4Mat Sync Plugin

Sync your Obsidian notes with [Kadi4Mat](https://kadi.iam.kit.edu) scientific data repository.

## 📖 Documentation

**[View Full Documentation](https://fcskit.github.io/obsidian-kadi4mat-sync/)**

## Features

- 🔄 **Bidirectional Sync** - Sync notes to Kadi4Mat records
- 📝 **Automatic Tracking** - Track sync state in note frontmatter
- 🎯 **Flexible Commands** - Sync current note, batch sync, or download from Kadi4Mat
- 📊 **Status Indicators** - Visual feedback for sync status
- ⚙️ **Easy Configuration** - Simple setup with Kadi4Mat credentials

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Settings → Community plugins
2. Browse community plugins
3. Search for "Kadi4Mat Sync"
4. Click Install, then Enable

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/your-org/obsidian-kadi4mat-sync/releases)
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-kadi4mat-sync/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

## Setup

1. Open Settings → Kadi4Mat Sync
2. Enter your Kadi4Mat instance URL (e.g., `https://kadi.iam.kit.edu`)
3. Enter your Personal Access Token (PAT)
   - Get your PAT from Kadi4Mat: User Settings → Personal Access Tokens
4. Click "Test Connection" to verify
5. Configure sync options (optional)

## Usage

### Sync Current Note

Use the command palette (`Ctrl/Cmd + P`) and search for:
- **Sync current note to Kadi4Mat** - Upload/update current note as a Kadi4Mat record
- **Download from Kadi4Mat** - Download a record from Kadi4Mat to create/update a note

### Batch Sync

- **Sync all modified notes** - Sync all notes that have been modified since last sync
- **Sync folder to Kadi4Mat** - Sync all notes in the current folder

### Frontmatter Fields

The plugin adds these fields to your note frontmatter:

```yaml
---
kadi_id: 12345              # Kadi4Mat record ID
kadi_identifier: ABC-123    # Record identifier
kadi_synced: 2026-02-11     # Last sync timestamp
kadi_state: draft           # Record state (draft/submitted/published)
---
```

### Example Workflow

1. Write your note in Obsidian
2. Run "Sync current note to Kadi4Mat"
3. Plugin creates a Kadi4Mat record and adds `kadi_id` to frontmatter
4. Make changes to your note
5. Run sync again - plugin updates the existing record
6. View/share the record on Kadi4Mat web interface

## Configuration

### Sync Options

- **Auto-sync on save** - Automatically sync notes when saved
- **Sync attachments** - Include embedded images and files
- **Default visibility** - Set default visibility for new records (private/internal/public)
- **Default state** - Set default state for new records (draft/submitted/published)
- **Conflict resolution** - Choose how to handle conflicts (local/remote/ask)

### Advanced Options

- **Custom metadata mapping** - Map note frontmatter fields to Kadi4Mat extras
- **Tag filtering** - Only sync notes with specific tags
- **Folder filtering** - Exclude specific folders from sync

## Commands

| Command | Description |
|---------|-------------|
| Sync current note to Kadi4Mat | Upload/update the active note |
| Download from Kadi4Mat | Download a record by ID |
| Sync folder to Kadi4Mat | Sync all notes in current folder |
| Sync all modified notes | Batch sync all changed notes |
| View sync status | Show sync status for current note |
| Open in Kadi4Mat | Open the current note's record in browser |

## Metadata Mapping

The plugin automatically maps Obsidian note fields to Kadi4Mat record fields:

| Obsidian | Kadi4Mat | Notes |
|----------|----------|-------|
| Note title | Record title | From first H1 or filename |
| Note content | Record description | Markdown content |
| Tags | Record extras | As `tags` metadata field |
| Custom frontmatter | Record extras | User-configurable mapping |
| Attachments | Record files | Images, PDFs, etc. |

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-org/obsidian-kadi4mat-sync.git
cd obsidian-kadi4mat-sync

# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev
```

### Project Structure

```
obsidian-kadi4mat-sync/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── settings.ts          # Settings interface and default values
│   ├── sync/
│   │   ├── SyncEngine.ts    # Core sync logic
│   │   ├── NoteSync.ts      # Note-to-record sync
│   │   └── FileSync.ts      # File/attachment sync
│   ├── ui/
│   │   ├── SettingsTab.ts   # Plugin settings UI
│   │   ├── StatusBar.ts     # Status bar indicator
│   │   └── modals/          # Various modal dialogs
│   └── utils/
│       ├── metadata.ts      # Frontmatter utilities
│       └── logger.ts        # Logging utilities
└── manifest.json            # Plugin manifest
```

## Requirements

- Obsidian v1.4.0 or higher
- Kadi4Mat account with API access
- Personal Access Token (PAT) from Kadi4Mat

## Dependencies

This plugin uses:
- [kadi4mat-client](https://github.com/your-org/kadi4mat-client) - TypeScript client for Kadi4Mat API
- Obsidian API (no external dependencies beyond kadi4mat-client)

**Note on CORS:** This plugin uses a custom fetch polyfill to avoid CORS issues in Obsidian's Electron environment. See [CORS-FIX.md](./CORS-FIX.md) for technical details.

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Kadi4Mat" or CORS errors
- The plugin includes a CORS fix for Obsidian's Electron environment
- If you still see CORS errors, try reloading Obsidian
- Check your internet connection
- Verify the Kadi4Mat URL is correct (e.g., `https://kadi.iam.kit.edu`)
- Ensure your PAT is valid and has necessary permissions
- See [CORS-FIX.md](./CORS-FIX.md) for detailed troubleshooting

### Sync Conflicts

**Problem**: "Conflict detected - note modified on both sides"
- Choose conflict resolution strategy in settings
- Manually resolve by choosing local or remote version
- Compare changes before deciding

### Missing Attachments

**Problem**: "Attachments not syncing"
- Enable "Sync attachments" in settings
- Check file size limits (Kadi4Mat may have upload limits)
- Verify file types are supported

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Development

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/obsidian-kadi4mat-sync.git
   cd obsidian-kadi4mat-sync
   npm install
   ```

2. **Build for development:**
   ```bash
   npm run dev
   ```
   This builds the plugin to `../obsidian-dev-vault/.obsidian/plugins/obsidian-kadi4mat-sync/`

3. **Open dev vault in Obsidian:**
   - Open `~/Documents/GitHub/obsidian-dev-vault` in Obsidian
   - Enable the plugin in Settings → Community plugins
   - Hot-reload will auto-reload on changes

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Build to shared dev vault |
| `npm run build` | Full production build with TypeScript checks |
| `npm run build-fast` | Quick production build (skip TS checks) |
| `npm run release` | Create release package |
| `npm run lint` | Run ESLint |

### Documentation

- [Build System](./BUILD-SYSTEM.md) - Complete build system documentation
- [Sync Modal](./SYNC-MODAL-DOCS.md) - User guide for sync modal
- [Implementation](./SYNC-MODAL-IMPLEMENTATION.md) - Technical implementation details

### Testing with ELN Plugin

This plugin is designed to work alongside the [obsidian-eln-plugin](https://github.com/fcskit/obsidian-eln-plugin).

Both plugins can be developed and tested together in the shared `obsidian-dev-vault`:

```bash
# Terminal 1 - ELN Plugin
cd obsidian-eln-plugin
npm run dev

# Terminal 2 - Sync Plugin
cd obsidian-kadi4mat-sync
npm run dev
```

Hot-reload will automatically refresh both plugins when files change.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/obsidian-kadi4mat-sync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/obsidian-kadi4mat-sync/discussions)
- **Kadi4Mat**: [Kadi4Mat Documentation](https://kadi.iam.kit.edu/docs)

## Related Projects

- [obsidian-eln-plugin](https://github.com/fcskit/obsidian-eln-plugin) - Electronic Lab Notebook plugin for Obsidian
- [kadi4mat-client](https://github.com/your-org/kadi4mat-client) - Standalone TypeScript client for Kadi4Mat API
- [kadi-apy](https://github.com/iam-cms/kadi-apy) - Official Python client for Kadi4Mat

## Acknowledgments

Created to enable seamless integration between Obsidian and Kadi4Mat for scientific data management.

---

**Made with ❤️ for the scientific community**
