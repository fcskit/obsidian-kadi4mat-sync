# Field Values Fix

## Problem
The sync was failing with "Bad Request" error because we were sending field values that don't match Kadi4Mat's expected formats.

## Root Causes Identified

### 1. License Field - Wrong Format ❌
**What we were sending:**
- `Apache-2.0` (SPDX identifier)
- `CC-BY-4.0` (SPDX identifier)
- `MIT` (short name)

**What Kadi4Mat expects:**
- `Apache Software License 2.0` (full name)
- `Creative Commons Attribution 4.0` (full name)
- `MIT License` (full name)

### 2. Visibility Field - Wrong Case ❌
**What we were sending:**
- `private` (lowercase)
- `public` (lowercase)
- `internal` (not supported)

**What Kadi4Mat expects:**
- `Private` (capitalized)
- `Public` (capitalized)
- Only two options available

### 3. State Field - Wrong Values ❌
**What we were sending:**
- `draft`
- `submitted`
- `published`

**What Kadi4Mat expects:**
- `active`
- `inactive`
- (Note: State field is not visible in web interface, values determined from API testing)

## Solution Implemented

### Updated License Dropdown
Changed from SPDX identifiers to full Kadi4Mat license names:

```typescript
.addOption('CCO 1.0', 'CC0 1.0 - Public Domain')
.addOption('Creative Commons Attribution 4.0', 'CC BY 4.0 - Attribution')
.addOption('Creative Commons Attribution Share-Alike 4.0', 'CC BY-SA 4.0 - Attribution-ShareAlike')
.addOption('Creative Commons Attribution-NonCommercial 4.0', 'CC BY-NC 4.0 - Attribution-NonCommercial')
.addOption('MIT License', 'MIT License')
.addOption('Apache Software License 2.0', 'Apache License 2.0')
.addOption('BSD 3-Clause "New" or "Revised" License (BSD-3-Clause)', 'BSD 3-Clause')
.addOption('GNU General Public License 3.0', 'GNU GPL 3.0')
.addOption('GNU Lesser General Public License 3.0', 'GNU LGPL 3.0')
.addOption('Eclipse Public License 2.0', 'Eclipse Public License 2.0')
.addOption('Mozilla Public License 2.0', 'Mozilla Public License 2.0')
.addOption('License Not Specified', 'Not Specified')
.addOption('Other (Open)', 'Other (Open)')
.addOption('Other (Attribution)', 'Other (Attribution)')
.addOption('Other (Not Open)', 'Other (Not Open)')
```

### Updated Visibility Dropdown
Changed to capitalized values matching Kadi4Mat:

```typescript
.addOption('Private', 'Private - Only you')
.addOption('Public', 'Public - Everyone')
```

### Updated State Dropdown
Changed to Kadi4Mat's state values:

```typescript
.addOption('active', 'Active')
.addOption('inactive', 'Inactive')
```

### Updated Default Settings
Changed default values to match:

```typescript
export const DEFAULT_SETTINGS: KadiSettings = {
	// ...
	defaultVisibility: 'Private',  // was 'private'
	defaultState: 'active',        // was 'draft'
	// ...
};
```

### Updated TypeScript Types
```typescript
export interface KadiSettings {
	// ...
	defaultVisibility: 'Private' | 'Public';      // was 'private' | 'internal' | 'public'
	defaultState: 'active' | 'inactive';          // was 'draft' | 'submitted' | 'published'
	// ...
}
```

## Files Modified

1. **`src/ui/SyncModal.ts`**
   - Updated license dropdown options
   - Updated visibility dropdown options
   - Updated state dropdown options
   - Updated type definitions

2. **`src/settings.ts`**
   - Updated KadiSettings interface types
   - Updated DEFAULT_SETTINGS values

3. **`src/ui/SettingsTab.ts`**
   - Updated default visibility dropdown
   - Updated default state dropdown

## Available Licenses in Kadi4Mat

For reference, Kadi4Mat supports **94 different licenses**. We've included the most common ones in the dropdown:

**Open Source:**
- CC0 1.0 (Public Domain)
- MIT License
- Apache Software License 2.0
- BSD 3-Clause
- GNU GPL 3.0
- GNU LGPL 3.0
- Eclipse Public License 2.0
- Mozilla Public License 2.0

**Creative Commons:**
- Creative Commons Attribution 4.0
- Creative Commons Attribution Share-Alike 4.0
- Creative Commons Attribution-NonCommercial 4.0

**Other:**
- License Not Specified
- Other (Open)
- Other (Attribution)
- Other (Not Open)

### Full License List

See user's message for the complete list of 94 licenses available in Kadi4Mat. For most scientific/research use cases, the licenses in our dropdown should be sufficient.

## Future Improvements

1. **License Selection Dialog**
   Add a separate dialog/modal for selecting from all 94 available licenses:
   - Main dropdown with ~15 most common licenses
   - "More licenses..." button opening a searchable dialog
   - Remember recently used licenses

2. **License Auto-detection**
   Detect license from frontmatter and map common SPDX identifiers:
   - `Apache-2.0` → `Apache Software License 2.0`
   - `MIT` → `MIT License`
   - `CC-BY-4.0` → `Creative Commons Attribution 4.0`

3. **State Field Research**
   Investigate exact meaning of `active`/`inactive` states:
   - When to use each
   - Whether other states exist
   - Document best practices

## Testing

To test the fix:

1. Reload Obsidian or restart the plugin
2. Open a note with frontmatter
3. Run "Sync to Kadi4Mat" command
4. Verify:
   - License dropdown shows full license names
   - Visibility shows "Private" and "Public" (capitalized)
   - State shows "Active" and "Inactive"
5. Try syncing with different license selections
6. Check debug log for success messages

## Related Documentation

- **CORS-FIX.md** - How we fixed the CORS issue with Obsidian's fetch polyfill
- **README.md** - Main plugin documentation
