# Quick Start - Obsidian Kadi4Mat Sync Plugin

## What's Been Created

✅ **Complete base implementation** of an Obsidian plugin that syncs notes with Kadi4Mat

### File Structure Created
- **17 files** across configuration, source code, and documentation
- **Build output**: main.js (34KB bundled plugin)
- **Dependencies**: 174 npm packages installed
- **Build status**: ✅ Successful (TypeScript compilation passed)

## How to Test the Plugin

### 1. Install in Obsidian

```bash
# Copy plugin to your test vault
cp -r /Users/gc9830/Documents/GitHub/obsidian-kadi4mat-sync \
      /path/to/your/vault/.obsidian/plugins/

# Or create a symlink for easier development
ln -s /Users/gc9830/Documents/GitHub/obsidian-kadi4mat-sync \
      /path/to/your/vault/.obsidian/plugins/obsidian-kadi4mat-sync
```

### 2. Reload Obsidian
- Open Obsidian
- Go to Settings → Community plugins
- Turn off "Restricted mode" if enabled
- Click "Reload" or restart Obsidian
- Enable "Kadi4Mat Sync" plugin

### 3. Configure Connection
- Open Settings → Kadi4Mat Sync
- Enter your Kadi4Mat host (e.g., `https://kadi.iam.kit.edu`)
- Enter your Personal Access Token (PAT)
  - Get PAT from: Kadi4Mat → User Settings → Personal Access Tokens
- Click "Test Connection" to verify

### 4. Sync Your First Note
- Open any note in Obsidian
- Press `Ctrl/Cmd + P` to open command palette
- Search for: **"Sync current note to Kadi4Mat"**
- Press Enter
- Check the status bar at the bottom for sync status
- Check the note's frontmatter - it should now have:
  ```yaml
  ---
  kadi_id: 12345
  kadi_identifier: ABC-123
  kadi_synced: 2026-02-11T...
  kadi_state: draft
  kadi_visibility: private
  ---
  ```

## Available Commands

Open command palette (`Ctrl/Cmd + P`) and search for:

- **Sync current note to Kadi4Mat** - Upload or update the active note
- **View sync status** - Show sync metadata for current note
- **Open in Kadi4Mat** - Open the note's record in browser
- **Test Kadi4Mat connection** - Verify your credentials

## Development Workflow

### Making Changes

```bash
# Navigate to plugin directory
cd /Users/gc9830/Documents/GitHub/obsidian-kadi4mat-sync

# Start development mode (watches for changes)
npm run dev

# In another terminal, rebuild kadi4mat-client if needed
cd /Users/gc9830/Documents/GitHub/kadi4mat-client
npm run build
```

### Testing Changes

1. Make code changes
2. Save files (dev mode auto-rebuilds)
3. In Obsidian: `Ctrl/Cmd + R` to reload the plugin
4. Or: Disable and re-enable the plugin in settings

### Building for Release

```bash
npm run build       # Production build
```

## Project Architecture

```
User writes note in Obsidian
          ↓
User runs "Sync to Kadi4Mat" command
          ↓
obsidian-kadi4mat-sync plugin:
  - SyncEngine.syncNote()
  - Extracts title, content, tags
  - Reads frontmatter (check for kadi_id)
          ↓
Uses kadi4mat-client library:
  - client.createRecord() or client.updateRecord()
  - Sends HTTP request to Kadi4Mat API
          ↓
Kadi4Mat server creates/updates record
          ↓
Plugin updates note frontmatter:
  - Adds kadi_id, kadi_identifier, kadi_synced
  - Shows success message
  - Updates status bar
```

## Key Features Implemented

### ✅ Working Now
- Create new Kadi4Mat records from notes
- Update existing records
- Track sync state in frontmatter
- Status bar indicator
- Settings UI with connection testing
- Tag-based filtering
- Folder exclusion
- Custom metadata mapping
- Debug logging

### 🚧 Coming Soon
- Download records from Kadi4Mat to create notes
- Batch sync folders
- Sync embedded images and files
- Conflict resolution UI
- Progress indicators for long operations
- Sync history tracking

## File Organization

```
src/
├── main.ts              # Plugin entry point - registers commands, settings
├── settings.ts          # Settings interface and defaults
├── sync/
│   └── SyncEngine.ts    # Core sync logic - create/update records
├── ui/
│   ├── SettingsTab.ts   # Settings UI - all configuration options
│   └── StatusBar.ts     # Status bar indicator - sync status display
└── utils/
    ├── metadata.ts      # Frontmatter operations - read/write kadi_* fields
    ├── noteParser.ts    # Note parsing - extract title, content, tags
    └── extrasHelper.ts  # Kadi4Mat extras conversion - object ↔ array
```

## Configuration Options

### Connection Settings
- **Host**: Your Kadi4Mat instance URL
- **PAT**: Personal Access Token for authentication
- **Timeout**: Request timeout (default: 60s)
- **Verify SSL**: Enable SSL certificate verification

### Sync Options
- **Auto-sync on save**: Automatically sync when saving (future)
- **Sync attachments**: Include embedded files (future)
- **Default visibility**: private/internal/public
- **Default state**: draft/submitted/published
- **Conflict resolution**: local/remote/ask

### Advanced Options
- **Tag filter**: Only sync notes with specific tags
- **Exclude folders**: Never sync certain folders
- **Custom metadata mapping**: Map frontmatter fields to Kadi extras
- **Debug mode**: Enable detailed logging

## Troubleshooting

### Plugin Won't Load
- Check Obsidian console: `Ctrl/Cmd + Shift + I` → Console tab
- Look for error messages
- Verify all files are in `.obsidian/plugins/obsidian-kadi4mat-sync/`
- Ensure `main.js` and `manifest.json` exist

### Connection Fails
- Verify Kadi4Mat URL is correct (include https://)
- Check PAT is valid (test in Kadi4Mat web interface)
- Check internet connection
- Try disabling "Verify SSL" if using self-signed certificate
- Enable debug mode in settings for detailed logs

### Sync Fails
- Check Obsidian console for error messages
- Verify note is not in excluded folder
- Check if tag filter is excluding the note
- Ensure PAT has permission to create/update records
- Try with a simpler note (just title and text)

## Next Steps

### For Testing
1. Test basic note sync (create and update)
2. Test with various note structures (with/without frontmatter)
3. Test tag filtering and folder exclusion
4. Test connection error handling
5. Test with large notes

### For Development
1. Implement download feature (see `PROJECT-STATUS.md` Phase 1)
2. Add file attachment sync
3. Create batch sync functionality
4. Add progress indicators
5. Implement conflict detection

### For Documentation
1. Record video tutorial
2. Create example workflows
3. Document common issues
4. Add screenshots to README

## Resources

- **Project Status**: `PROJECT-STATUS.md` - Detailed implementation status
- **User Docs**: `README.md` - Full user documentation
- **Library Docs**: `../kadi4mat-client/README.md` - API client documentation
- **Kadi4Mat API**: https://kadi.iam.kit.edu/docs - Platform documentation

## Questions?

Check these files:
- `PROJECT-STATUS.md` - What's implemented, what's pending, known issues
- `README.md` - User documentation, features, configuration
- `src/main.ts` - Plugin initialization, commands, event handlers
- `src/sync/SyncEngine.ts` - Core sync logic

---

**Status**: ✅ Base implementation complete and ready for testing!

**Next action**: Test sync with your Kadi4Mat instance to validate the workflow.
