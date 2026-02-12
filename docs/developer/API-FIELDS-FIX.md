# Kadi4Mat API Field Fixes

## Problem Summary

Initial sync attempts failed with "Bad Request" error. Investigation revealed three field format issues:

1. **Missing required `identifier` field**
2. **Incorrect license format** (using full names instead of SPDX codes)
3. **Incorrect visibility capitalization** (using capitalized instead of lowercase)

## Investigation Process

### 1. Enhanced Error Logging

Added detailed error logging to capture full API error responses:

```typescript
// Now logs:
// - error.message
// - error.statusCode
// - error.response (full API validation details)
```

### 2. Queried Existing Records

Created `examples/list-records.ts` in kadi4mat-client to inspect actual field formats:

```bash
npx tsx examples/list-records.ts
```

**Key Findings:**
```json
{
  "identifier": "test-record-created-via-api-2026-02-11t13-53-50",
  "state": "active",
  "visibility": "private",
  "license": "CC-BY-4.0"
}
```

## Solutions Implemented

### 1. Identifier Field - Auto-Generation ✅

**Problem:** Identifier is required but was optional in our code

**Solution:** Added automatic identifier generation

```typescript
// src/sync/SyncEngine.ts
private generateIdentifier(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // Alphanumeric + hyphens
        .replace(/^-+|-+$/g, '')      // Trim hyphens
        .substring(0, 50);             // Limit length
    
    const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace(/T/, '-')
        .replace(/Z$/, '')
        .toLowerCase();
    
    return `${slug}-${timestamp}`;
}
```

**Usage:**
```typescript
const identifier = kadiFields.identifier || this.generateIdentifier(params.title);

const createParams = {
    identifier: identifier,  // Always included
    // ...
};
```

### 2. License Field - SPDX Codes ✅

**Problem:** We were using full license names:
- ❌ `"Creative Commons Attribution 4.0"`
- ❌ `"Apache Software License 2.0"`

**Solution:** Use SPDX short codes as values, full names as display labels:

```typescript
// src/ui/SyncModal.ts
.addOption('CC-BY-4.0', 'Creative Commons Attribution 4.0')
.addOption('Apache-2.0', 'Apache Software License 2.0')
.addOption('MIT', 'MIT License')
.addOption('BSD-3-Clause', 'BSD 3-Clause "New" or "Revised" License (BSD-3-Clause)')
// etc.
```

**What User Sees:** "Creative Commons Attribution 4.0"  
**What API Receives:** `"CC-BY-4.0"`

### 3. Visibility Field - Lowercase ✅

**Problem:** We used capitalized values:
- ❌ `"Private"`
- ❌ `"Public"`

**Solution:** Changed to lowercase (matching API):

```typescript
// src/ui/SyncModal.ts
.addOption('private', 'Private - Only you')
.addOption('public', 'Public - Everyone')
```

**Type Definitions:**
```typescript
visibility: 'private' | 'public'  // lowercase
```

### 4. State Field - Active/Inactive ✅

**Problem:** We were using draft/submitted/published

**Solution:** Changed to active/inactive (actual API values):

```typescript
// src/ui/SyncModal.ts
.addOption('active', 'Active')
.addOption('inactive', 'Inactive')
```

**Updated kadi4mat-client types:**
```typescript
// src/types/records.ts
state: 'draft' | 'active' | 'inactive' | 'submitted' | 'published'
```

## Files Modified

### obsidian-kadi4mat-sync

1. **`src/ui/SyncModal.ts`**
   - Fixed license dropdown (SPDX codes + full names)
   - Fixed visibility (lowercase)
   - Fixed state (active/inactive)
   - Updated type definitions

2. **`src/settings.ts`**
   - Updated type definitions
   - Updated default values

3. **`src/ui/SettingsTab.ts`**
   - Updated dropdown options

4. **`src/sync/SyncEngine.ts`**
   - Added `generateIdentifier()` method
   - Always include identifier in createRecord
   - Updated method signatures

### kadi4mat-client

1. **`src/types/records.ts`**
   - Updated `Record` interface to include 'active' and 'inactive' states
   - Updated `CreateRecordParams` to support all state values
   - Added missing fields: `license`, `tags` to `CreateRecordParams`
   - Updated `UpdateRecordParams` to match

2. **`examples/list-records.ts`** ✨ NEW
   - Utility to query and inspect existing records
   - Helps verify actual API field formats

## Current Field Formats

### Correct Format Summary

| Field | Format | Example |
|-------|--------|---------|
| `identifier` | slug-timestamp | `test-record-2026-02-12-10-31-36-519` |
| `state` | lowercase string | `active`, `inactive` |
| `visibility` | lowercase string | `private`, `public` |
| `license` | SPDX code | `CC-BY-4.0`, `MIT`, `Apache-2.0` |
| `title` | any string | `"My Experiment Record"` |
| `tags` | string array | `["experiment", "synthesis"]` |

### License Mapping (Most Common)

| SPDX Code | Full Name (Display) |
|-----------|---------------------|
| `CC0-1.0` | CCO 1.0 |
| `CC-BY-4.0` | Creative Commons Attribution 4.0 |
| `CC-BY-SA-4.0` | Creative Commons Attribution Share-Alike 4.0 |
| `CC-BY-NC-4.0` | Creative Commons Attribution-NonCommercial 4.0 |
| `MIT` | MIT License |
| `Apache-2.0` | Apache Software License 2.0 |
| `BSD-3-Clause` | BSD 3-Clause "New" or "Revised" License |
| `GPL-3.0` | GNU General Public License 3.0 |
| `AFL-3.0` | Academic Free License 3.0 |

See Kadi4Mat web interface for complete list of ~94 licenses.

## Testing Checklist

- [x] Build kadi4mat-client with updated types
- [x] Build obsidian-kadi4mat-sync plugin
- [ ] Test sync with sample note
- [ ] Verify identifier is auto-generated
- [ ] Verify license SPDX code is sent
- [ ] Verify visibility is lowercase
- [ ] Verify state is 'active'
- [ ] Check created record in Kadi4Mat web interface
- [ ] Verify all metadata fields are synced correctly

## Next Steps

1. **Test sync in Obsidian** with sample note
2. **Verify success** by checking:
   - Debug log shows successful creation
   - Record appears in Kadi4Mat web interface
   - All metadata fields are correct
3. **If still issues:**
   - Save debug log
   - Check full API error response
   - Cross-reference with actual record structure

## Related Documentation

- **CORS-FIX.md** - How we fixed CORS issues with Obsidian fetch polyfill
- **FIELD-VALUES-FIX.md** - Initial attempt at fixing field values (superseded by this document)
- **kadi4mat-client/examples/list-records.ts** - Query tool for inspecting actual API data
