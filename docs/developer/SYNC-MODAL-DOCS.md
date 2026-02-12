# Sync Modal Documentation

## Overview

The Sync Modal is a dialog that appears before creating or updating a Kadi4Mat record. It provides:

1. **Configuration Options** - Edit title, state, visibility, and license
2. **Debug Information** - Real-time logging of the sync process
3. **Metadata Preview** - See what will be sent to Kadi4Mat
4. **Debug Log Export** - Save logs for troubleshooting

## Features

### 1. Record Configuration

#### Title
- Pre-filled from `kadi_title` frontmatter or file basename
- Can be edited before sync
- Required field

#### State
Options:
- **Draft** - Work in progress
- **Submitted** - Under review
- **Published** - Finalized and public

#### Visibility
Options:
- **Private** - Only you can view
- **Internal** - Organization members can view
- **Public** - Everyone can view

#### License
Predefined options:
- `CC0-1.0` - Public Domain
- `CC-BY-4.0` - Attribution
- `CC-BY-SA-4.0` - Attribution-ShareAlike
- `CC-BY-NC-4.0` - Attribution-NonCommercial
- `CC-BY-NC-SA-4.0` - Attribution-NonCommercial-ShareAlike
- `MIT` - MIT License
- `Apache-2.0` - Apache License 2.0
- `GPL-3.0` - GNU GPL 3.0
- `Other` - Other/Proprietary

The selected license is saved to the note's frontmatter as `kadi_license`.

### 2. Debug Information

The modal shows real-time debug messages during the sync process:

```
[13:45:23.456] Initializing sync for: path/to/note.md
[13:45:23.457] Mode: Create
[13:45:23.458] Title changed to: My Experiment
[13:45:23.459] User confirmed sync with parameters
[13:45:23.460] Extracting Kadi4Mat fields from frontmatter
[13:45:23.461] Found 5 custom metadata fields
[13:45:23.462] Converting metadata to Kadi4Mat extras format
[13:45:23.463] Generated 12 extras fields
[13:45:23.464] Including 2 nested structures (dict/list)
[13:45:23.465] Sending create request to Kadi4Mat API...
[13:45:24.123] ✅ Record created successfully with ID: 25097
```

**Features:**
- Timestamps for all messages
- Auto-scroll to bottom
- Survives during the entire sync operation
- Shows errors in red

### 3. Preview Metadata Button

Click "Preview" to see:
- Title, state, visibility, license
- Tags that will be synced
- Number of extras fields
- Sample of first 3 extras
- List of nested structures (dict/list)

Example output:
```json
{
  "title": "Battery Test Experiment",
  "state": "draft",
  "visibility": "private",
  "license": "CC-BY-4.0",
  "tags": ["battery", "experiment", "xrd"],
  "extras_count": 12,
  "extras_sample": [
    { "key": "experimenter", "type": "str", "value": "John Doe" },
    { "key": "temperature", "type": "float", "value": 25.5, "unit": "°C" },
    { "key": "pressure", "type": "int", "value": 1013 }
  ]
}
Total extras fields: 12
Nested structures: 2
  - sample (dict)
  - measurements (list)
```

### 4. Save Debug Log Button

Click "Save Log" to export all debug messages to a text file in your vault root:

**Filename format:** `kadi-sync-log-YYYY-MM-DDTHH-mm-ss.txt`

**Example:**
```
Kadi4Mat Sync Debug Log
==================================================
Generated: 2026-02-11T13:45:25.789Z
File: Experiments/2026-02-11/battery-test.md
Mode: Create
==================================================

[13:45:23.456] Initializing sync for: Experiments/2026-02-11/battery-test.md
[13:45:23.457] Mode: Create
[13:45:23.458] User confirmed sync with parameters
...
[13:45:24.123] ✅ Record created successfully with ID: 25097
```

**Use cases:**
- Troubleshooting sync failures
- Analyzing what metadata is being sent
- Reporting bugs
- Understanding the sync process

## Usage

### Basic Workflow

1. **Open note** you want to sync
2. **Run command**: "Kadi4Mat: Sync Current Note"
3. **Modal appears** with pre-filled values
4. **Review/edit** title, state, visibility, license
5. **(Optional)** Click "Preview" to see metadata
6. **Click "Create Record"** or "Update Record"
7. **Watch debug messages** in real-time
8. **Modal closes** on success

### Debugging Workflow

1. **Open modal** as above
2. **Edit configuration** as needed
3. **Click "Preview"** to see what will be sent
4. **Review debug messages** for any warnings
5. **Click "Create/Update"**
6. **Watch for errors** in debug section
7. **(If error)** Click "Save Log" button
8. **Analyze log file** for details

## Error Handling

### Empty Title
If you clear the title field:
```
ERROR: Title is required
```
Modal stays open, you can fix it.

### Network Error
If Kadi4Mat API is unreachable:
```
❌ ERROR: Network request failed: Failed to fetch
Sync failed: Network request failed: Failed to fetch
```
Modal stays open, you can retry or save the log.

### API Error
If Kadi4Mat rejects the request:
```
❌ ERROR: 400 Bad Request: extras.0.type: Missing required field
```
Modal stays open, you can save the log and investigate.

## Frontmatter Integration

The modal reads and writes these frontmatter fields:

### Input (Read from note)
```yaml
---
kadi_title: "Experiment Title"        # Pre-fills title field
kadi_state: "draft"                    # Pre-fills state dropdown
kadi_visibility: "private"             # Pre-fills visibility dropdown
kadi_license: "CC-BY-4.0"              # Pre-fills license dropdown
kadi_id: 25096                         # Determines if create/update
kadi_identifier: "rec-abc-123"         # Read-only
---
```

### Output (Written after sync)
```yaml
---
# Added on CREATE:
kadi_id: 25097
kadi_identifier: "rec-def-456"
kadi_synced: "2026-02-11T13:45:24.789Z"
kadi_state: "draft"
kadi_visibility: "private"
kadi_license: "CC-BY-4.0"

# Added on UPDATE:
kadi_modified: "2026-02-11T14:23:15.123Z"
---
```

## Advanced Usage

### Debugging Metadata Conversion

To see exactly what's being converted:

1. Open modal
2. Click "Preview Metadata"
3. Check debug output:
   - Number of extras fields
   - Which fields are nested (dict/list)
   - Sample values
4. If unexpected, check your frontmatter

### Comparing Create vs Update

**Create Mode:**
- Modal title: "Create Kadi4Mat Record"
- Button: "Create Record"
- No record ID shown
- Debug: `Mode: Create`

**Update Mode:**
- Modal title: "Update Kadi4Mat Record"
- Button: "Update Record"
- Shows record ID
- Debug: `Mode: Update`, `Record ID: 25096`

### Tracking Nested Structures

The debug log shows nested structures:
```
Including 2 nested structures (dict/list)
```

Preview shows their names:
```
Nested structures: 2
  - sample (dict)
  - measurements (list)
```

This helps verify that your nested frontmatter is being converted correctly.

## Keyboard Shortcuts

- **Enter** - Confirm sync (when focus not on text input)
- **Escape** - Cancel and close modal

## Styling

The modal uses Obsidian's CSS variables for theming:

- `--background-primary` - Main background
- `--background-secondary` - Settings container background
- `--text-normal` - Main text color
- `--text-muted` - Muted text (file info, etc.)
- `--font-monospace` - Debug messages font

Works with all Obsidian themes automatically.

## Examples

### Example 1: Simple Experiment

**Frontmatter:**
```yaml
---
experimenter: "Jane Smith"
temperature: "25.5 °C"
completed: false
---
```

**Modal Actions:**
1. Set title: "Temperature Test"
2. Set state: "draft"
3. Set visibility: "private"
4. Set license: "CC-BY-4.0"
5. Click "Preview":
   ```
   extras_count: 5
   extras_sample:
     - experimenter: "Jane Smith"
     - temperature: 25.5 °C (unit parsed!)
     - completed: false
     - obsidian_filename: "..."
     - created_date: "..."
   ```
6. Click "Create Record"
7. Watch debug: "✅ Record created successfully with ID: 25098"

### Example 2: Complex Nested Data

**Frontmatter:**
```yaml
---
sample:
  name: "LiFePO4"
  mass: "15.3 g"
  purity: 0.995
measurements:
  - 25.5
  - 26.1
  - 25.8
---
```

**Modal Actions:**
1. Click "Preview":
   ```
   Nested structures: 2
     - sample (dict)
     - measurements (list)
   extras_count: 7
   ```
2. Debug shows:
   ```
   Including 2 nested structures (dict/list)
   ```
3. Confirms nested conversion is working

### Example 3: Debugging Failure

**Scenario:** Sync fails with API error

**Steps:**
1. Modal shows error:
   ```
   ❌ ERROR: 400 Bad Request: Invalid state value
   ```
2. Click "Save Log"
3. Check log file:
   ```
   Request params: {
     "title": "Test",
     "state": "invalid",  ← Found the problem!
     ...
   }
   ```
4. Fix state in modal
5. Retry

## Tips

1. **Always preview first** - Especially for complex metadata
2. **Save logs on errors** - Helps with troubleshooting
3. **Watch the debug section** - See what's happening in real-time
4. **Use descriptive titles** - Makes finding records easier
5. **Set correct license** - Important for data sharing
6. **Check nested structures** - Verify they're being converted

## Troubleshooting

### Modal doesn't open
- Check if Kadi4Mat is configured in settings
- Verify the file is not excluded by filters

### Debug section empty
- This shouldn't happen - file a bug report
- Try clicking "Preview" to trigger messages

### Log file not saved
- Check vault permissions
- Check if filename is valid
- Look for error notice

### Metadata not showing in preview
- Check frontmatter syntax
- Verify fields aren't in exclusion list
- Check if fields start with `kadi_` (those are control fields)

### Nested structures not detected
- Verify YAML indentation
- Check object vs array syntax
- Click "Preview" to see what's generated

## Implementation Details

### Modal Lifecycle

1. **Constructor** - Extract frontmatter, initialize values
2. **onOpen()** - Build UI, add settings, create debug section
3. **User edits** - Log changes to debug
4. **Preview clicked** - Generate metadata preview
5. **Confirm clicked** - Call onConfirm callback
6. **Callback** - SyncEngine creates/updates record
7. **Success/Error** - Log result, close on success
8. **onClose()** - Clean up UI

### Debug Message Format

```typescript
[HH:MM:SS.mmm] Message text
```

- Timestamp from `.toISOString().split('T')[1].substring(0, 12)`
- Auto-scrolls to bottom
- Preserved across operations

### Integration with SyncEngine

```typescript
// SyncEngine creates modal
const modal = new SyncModal(app, plugin, file, async (params) => {
  // This callback is called when user confirms
  modal.logDebug('User confirmed');
  
  // SyncEngine uses params to create/update record
  await this.createRecordWithModal(file, params, description, content, modal);
  
  // Modal logs all steps
  modal.logDebug('✅ Complete');
});

modal.open();
```

The `modal.logDebug()` method can be called from SyncEngine to log messages during API calls.

## Future Enhancements

Possible improvements:

1. **Real-time validation** - Check title/state as user types
2. **Metadata diff view** - Show what changed (for updates)
3. **Custom license field** - Allow entering custom license text
4. **Conflict detection** - Warn if record modified elsewhere
5. **Batch mode** - Sync multiple notes with same settings
6. **Template presets** - Save common configurations
7. **Syntax highlighting** - Color code debug messages
8. **Export formats** - JSON/CSV export of metadata

## Related Files

- `src/ui/SyncModal.ts` - Modal implementation
- `src/sync/SyncEngine.ts` - Sync logic with modal integration
- `src/utils/frontmatter.ts` - Frontmatter extraction utilities
- `INTEGRATION-COMPLETE.md` - Overall integration documentation

## See Also

- [Kadi4Mat API Documentation](https://kadi4mat.readthedocs.io/)
- [FRONTMATTER-MAPPING-STRATEGY.md](../kadi4mat-client/FRONTMATTER-MAPPING-STRATEGY.md) - Conversion design
- [MAPPING-IMPLEMENTATION-COMPLETE.md](../kadi4mat-client/MAPPING-IMPLEMENTATION-COMPLETE.md) - Conversion implementation
