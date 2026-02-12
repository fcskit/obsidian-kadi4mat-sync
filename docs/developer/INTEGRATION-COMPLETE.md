# Obsidian Kadi4Mat Plugin - Conversion Integration Complete

## Summary

Successfully integrated the `jsonToExtras()` and `extrasToJson()` conversion utilities from the kadi4mat-client library into the obsidian-kadi4mat-sync plugin. The plugin now supports:

- ✅ Nested metadata structures (e.g., `sample.name`, `sample.mass`)
- ✅ Array/list handling
- ✅ Unit parsing from strings (e.g., "25.5 °C")
- ✅ Automatic type detection for Kadi4Mat
- ✅ Filtering of Obsidian-specific fields
- ✅ Extraction of Kadi4Mat control fields

## What Was Changed

### 1. Updated Dependencies

```bash
cd /Users/gc9830/Documents/GitHub/obsidian-kadi4mat-sync
npm install
```

This pulled in the latest kadi4mat-client library with conversion utilities.

### 2. New File: `src/utils/frontmatter.ts`

Created comprehensive frontmatter extraction utilities:

**Key Functions:**
- `extractKadiFields(file, frontmatter)` - Extracts kadi_* prefixed fields and Obsidian tags
- `filterMetadata(frontmatter)` - Removes Kadi4Mat and Obsidian-specific fields
- `extractTags(frontmatter)` - Normalizes Obsidian tags
- `isSynced(frontmatter)` - Checks if note has been synced
- `createKadiFrontmatter(record)` - Creates frontmatter fields from record

**Excluded Fields:**
```typescript
'cssclasses', 'cssclass', 'aliases', 'alias', 'position', 'tags',
'kadi_id', 'kadi_identifier', 'kadi_title', 'kadi_state', 
'kadi_visibility', 'kadi_synced', 'kadi_modified', 'kadi_tags'
```

### 3. Updated: `src/sync/SyncEngine.ts`

**Imports:**
```typescript
import { jsonToExtras, extrasToJson } from 'kadi4mat-client';
import {
  extractKadiFields,
  filterMetadata,
  isSynced,
  createKadiFrontmatter
} from '../utils/frontmatter';
```

**createRecord() Method:**
- Extracts Kadi4Mat fields from frontmatter
- Filters custom metadata (removes Obsidian/kadi_* fields)
- Adds Obsidian context (filename, vault name, timestamp)
- Converts to Kadi4Mat extras with nested structure support
- Validates state and visibility values
- Updates note frontmatter after creation

**updateRecord() Method:**
- Same extraction and conversion flow as createRecord
- Validates state/visibility values
- Supports partial updates
- Updates sync timestamps

### 4. Updated: `src/main.ts` and `src/ui/SettingsTab.ts`

Fixed User type reference:
```typescript
// Before: user.username (incorrect)
// After: user.identity.username (correct)
```

### 5. Updated: `src/utils/extrasHelper.ts`

Deprecated the old helper functions in favor of the new conversion utilities:
```typescript
/**
 * @deprecated Use jsonToExtras from kadi4mat-client instead
 */
export function objectToExtras(...)
```

Fixed type definitions to match kadi4mat-client's type system ('str', 'int', 'float', 'bool').

## How It Works

### Sync Flow (Obsidian → Kadi4Mat)

```typescript
// 1. Read note frontmatter
const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;

// 2. Extract Kadi4Mat control fields
const kadiFields = extractKadiFields(file, frontmatter);
// Result: { title, identifier, state, visibility, tags, recordId }

// 3. Filter custom metadata
const customMetadata = filterMetadata(frontmatter);
// Result: All fields EXCEPT kadi_*, cssclasses, aliases, etc.

// 4. Add Obsidian context
const metadataWithContext = {
  ...customMetadata,
  obsidian_filename: file.path,
  obsidian_vault: this.plugin.app.vault.getName(),
  created_date: new Date().toISOString(),
};

// 5. Convert to Kadi4Mat extras
const extras = jsonToExtras(metadataWithContext, {
  nestObjects: true,  // sample.name → dict structure
  parseUnits: true,   // "25.5 °C" → {value: 25.5, unit: "°C"}
});

// 6. Create/update record
const record = await client.createRecord({
  title: kadiFields.title,
  state: kadiFields.state || 'draft',
  visibility: kadiFields.visibility || 'private',
  tags: kadiFields.tags,
  extras: extras
});

// 7. Update note with Kadi4Mat identifiers
await updateKadiFrontmatter(app, file, createKadiFrontmatter(record));
```

## Example: Obsidian Note → Kadi4Mat Record

### Input: Obsidian Note Frontmatter

```yaml
---
# Kadi4Mat control fields (extracted separately)
kadi_title: "Battery Test Experiment"
kadi_state: "draft"
kadi_visibility: "private"
kadi_tags:
  - battery
  - experiment

# Obsidian-specific (filtered out)
cssclasses: [experiment]
aliases: [exp-001]

# Custom metadata (converted to extras)
experimenter: "John Doe"
lab: "Battery Lab"
temperature: "25.5 °C"
pressure: 1013
completed: false

sample:
  name: "Lithium Iron Phosphate"
  type: "powder"
  mass: "15.3 g"
  purity: 0.995
  active: true

tags:
  - xrd
  - electrochemistry
---
```

### Output: Kadi4Mat Record

```json
{
  "title": "Battery Test Experiment",
  "state": "draft",
  "visibility": "private",
  "tags": ["battery", "experiment", "xrd", "electrochemistry"],
  "extras": [
    { "key": "experimenter", "type": "str", "value": "John Doe" },
    { "key": "lab", "type": "str", "value": "Battery Lab" },
    { "key": "temperature", "type": "float", "value": 25.5, "unit": "°C" },
    { "key": "pressure", "type": "int", "value": 1013 },
    { "key": "completed", "type": "bool", "value": false },
    {
      "key": "sample",
      "type": "dict",
      "value": [
        { "key": "name", "type": "str", "value": "Lithium Iron Phosphate" },
        { "key": "type", "type": "str", "value": "powder" },
        { "key": "mass", "type": "float", "value": 15.3, "unit": "g" },
        { "key": "purity", "type": "float", "value": 0.995 },
        { "key": "active", "type": "bool", "value": true }
      ]
    },
    { "key": "obsidian_filename", "type": "str", "value": "..." },
    { "key": "obsidian_vault", "type": "str", "value": "..." },
    { "key": "created_date", "type": "str", "value": "2026-02-11T..." }
  ]
}
```

## Field Mapping Rules

### 1. Kadi4Mat Control Fields (Top-Level)

These map directly to record properties:

| Obsidian Frontmatter | Kadi4Mat Record | Notes |
|---------------------|----------------|-------|
| `kadi_title` | `title` | Falls back to file basename |
| `kadi_identifier` | `identifier` | Optional unique ID |
| `kadi_state` | `state` | Must be: draft/submitted/published |
| `kadi_visibility` | `visibility` | Must be: private/internal/public |
| `kadi_tags` + `tags` | `tags[]` | Combined and deduplicated |
| `kadi_id` | (used for updates) | Read-only, set by plugin |

### 2. Obsidian-Specific Fields (Filtered Out)

These are NOT synced to Kadi4Mat:

- `cssclasses`, `cssclass`
- `aliases`, `alias`
- `position`
- `tags` (but content IS extracted and merged with kadi_tags)

### 3. Custom Metadata (Converted to Extras)

All other frontmatter fields are converted using `jsonToExtras()`:

**Simple Values:**
```yaml
experimenter: "John Doe"  → { key: "experimenter", type: "str", value: "John Doe" }
temperature: 25.5         → { key: "temperature", type: "float", value: 25.5 }
completed: false          → { key: "completed", type: "bool", value: false }
```

**Unit Parsing:**
```yaml
temperature: "25.5 °C"    → { key: "temperature", type: "float", value: 25.5, unit: "°C" }
mass: "15.3 g"            → { key: "mass", type: "float", value: 15.3, unit: "g" }
```

**Nested Objects:**
```yaml
sample:
  name: "LiFePO4"
  mass: "15.3 g"
```

Becomes a `dict` structure:
```json
{
  "key": "sample",
  "type": "dict",
  "value": [
    { "key": "name", "type": "str", "value": "LiFePO4" },
    { "key": "mass", "type": "float", "value": 15.3, "unit": "g" }
  ]
}
```

**Arrays:**
```yaml
measurements: [25.5, 26.1, 25.8]
```

Becomes a `list` structure:
```json
{
  "key": "measurements",
  "type": "list",
  "value": [
    { "type": "float", "value": 25.5 },
    { "type": "float", "value": 26.1 },
    { "type": "float", "value": 25.8 }
  ]
}
```

## Testing the Integration

### 1. Create a Test Note

Create a file `test-sync.md` in your Obsidian vault:

```markdown
---
kadi_title: "Test Sync Integration"
kadi_state: "draft"
kadi_visibility: "private"
kadi_tags:
  - test
  - integration

experimenter: "Test User"
temperature: "25.5 °C"
pressure: 1013
completed: false

sample:
  name: "Test Sample"
  mass: "10.5 g"
  type: "powder"

measurements:
  - 25.5
  - 26.1
  - 25.8

tags:
  - obsidian
  - metadata
---

# Test Sync Integration

This is a test note to verify the conversion integration works correctly.
```

### 2. Sync the Note

1. Open the note in Obsidian
2. Run the command: "Kadi4Mat: Sync Current Note"
3. Check for success notice: "✅ Created Kadi4Mat record: [identifier]"

### 3. Verify in Kadi4Mat Web UI

1. Open the record in Kadi4Mat web interface
2. Check the "Extras" section
3. Verify nested structures appear correctly
4. Check that units are parsed and displayed

### 4. Check Updated Frontmatter

After sync, the note should have:

```yaml
---
kadi_id: [record ID]
kadi_identifier: "[unique identifier]"
kadi_synced: "2026-02-11T..."
kadi_state: "draft"
kadi_visibility: "private"

# ... rest of your metadata ...
---
```

## Known Limitations

### 1. State and Visibility Validation

The plugin validates state/visibility values. Invalid values are replaced with defaults:

**Valid States:** `draft`, `submitted`, `published`  
**Valid Visibilities:** `private`, `internal`, `public`

If `kadi_state: "invalid"` → Falls back to plugin default (usually "draft")

### 2. No Auto-Type Detection in Kadi4Mat API

The Kadi4Mat API does **NOT** auto-detect types. The conversion layer is **required** - you cannot send plain JSON without explicit `type` fields.

### 3. Bidirectional Sync Not Yet Implemented

Currently only supports:
- ✅ Push: Obsidian → Kadi4Mat (create/update)
- ❌ Pull: Kadi4Mat → Obsidian (not yet implemented)

To implement pull, use:
```typescript
const record = await client.getRecord(recordId);
const metadata = extrasToJson(record.extras);
// Update Obsidian note frontmatter
```

### 4. Conflict Resolution

If the note is modified in both Obsidian and Kadi4Mat:
- Last write wins
- No merge logic yet
- Consider adding timestamp comparison

## Next Steps

### Immediate (Ready to Test)

1. ✅ Build successful
2. ⏳ Test with real Obsidian vault
3. ⏳ Test with real Kadi4Mat instance
4. ⏳ Verify nested structures in web UI
5. ⏳ Test unit parsing display

### Short-term (Enhancements)

1. Implement pull operation (Kadi4Mat → Obsidian)
   - Use `extrasToJson()` to convert back
   - Update note frontmatter
   - Handle conflicts

2. Add batch sync
   - Sync multiple notes at once
   - Progress indicator
   - Error handling per-note

3. Add sync status UI
   - Show which notes are synced
   - Show last sync time
   - Show sync conflicts

4. Configuration options
   - Toggle nested vs flat structure
   - Toggle unit parsing
   - Custom field mappings
   - Default state/visibility per folder

### Medium-term (Advanced Features)

1. Selective field sync
   - Choose which fields to sync
   - Exclude certain metadata patterns
   - Bi-directional field mapping rules

2. Template system
   - Pre-defined metadata structures
   - Validation rules
   - Required field checking

3. Conflict resolution UI
   - Show differences
   - Choose which version to keep
   - Manual merge

4. Background sync
   - Auto-sync on file change
   - Debounced updates
   - Conflict detection

## Files Changed

```
obsidian-kadi4mat-sync/
├── src/
│   ├── main.ts                      (Updated: user.identity.username)
│   ├── sync/
│   │   └── SyncEngine.ts            (Updated: Use jsonToExtras/filterMetadata)
│   ├── ui/
│   │   └── SettingsTab.ts           (Updated: user.identity.username)
│   └── utils/
│       ├── frontmatter.ts           (NEW: Field extraction utilities)
│       └── extrasHelper.ts          (Updated: Deprecated, fixed types)
└── package.json                     (Already had kadi4mat-client dep)
```

## Build Output

```bash
npm run build
# ✅ SUCCESS - No errors
```

## Documentation

- See `FRONTMATTER-MAPPING-STRATEGY.md` in kadi4mat-client for design details
- See `MAPPING-IMPLEMENTATION-COMPLETE.md` in kadi4mat-client for conversion API docs
- See test files in kadi4mat-client/scripts/ for conversion examples

## Success Criteria

✅ **All Completed:**

1. Dependency updated with conversion utilities
2. Frontmatter extraction utilities created
3. SyncEngine updated to use jsonToExtras()
4. Type errors resolved (User.identity.username)
5. Build successful
6. No deprecation warnings
7. Backward compatibility maintained (old extrasHelper kept)
8. Comprehensive documentation created

## Testing Checklist

Before deploying to production:

- [ ] Test simple metadata sync
- [ ] Test nested object structures
- [ ] Test array/list structures
- [ ] Test unit parsing ("25.5 °C")
- [ ] Test tag merging (kadi_tags + tags)
- [ ] Test state/visibility validation
- [ ] Test with missing frontmatter
- [ ] Test update operation
- [ ] Test error handling (network errors)
- [ ] Test with large notes
- [ ] Test with special characters
- [ ] Verify in Kadi4Mat web UI

## Conclusion

The integration is **complete and ready for testing**. The plugin now fully supports the two-layer architecture:

1. **Client Layer** (kadi4mat-client): Generic JSON ↔ Kadi4Mat conversion ✅
2. **Plugin Layer** (obsidian-kadi4mat-sync): Obsidian-specific field mapping ✅

All conversions are handled by the battle-tested `jsonToExtras()` function with comprehensive test coverage. The plugin correctly filters Obsidian-specific fields and extracts Kadi4Mat control fields.

Next step: **Test with a real Obsidian vault and Kadi4Mat instance!**
