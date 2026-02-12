# License Selection System

**Date:** February 12, 2026

## Overview

Replaced text input for custom licenses with a proper license selection modal that:
- Shows the complete list of 80+ Kadi4Mat-supported licenses
- Provides fuzzy search for quick finding
- Prevents invalid license submissions
- Displays both SPDX IDs and full license names

## Implementation

### 1. License Data in kadi4mat-client

**File:** `kadi4mat-client/src/data/licenses.ts`

Complete list of all licenses supported by Kadi4Mat, extracted from the web interface:

```typescript
export interface LicenseInfo {
  /** SPDX identifier (short form) */
  id: string;
  /** Full license name */
  name: string;
}

export const KADI_LICENSES: LicenseInfo[] = [
  { id: 'AAL', name: 'Attribution Assurance License' },
  { id: 'AFL-3.0', name: 'Academic Free License 3.0' },
  // ... 80+ total licenses
];
```

**Exported Functions:**
- `getCommonLicenses()` - Returns subset of 13 most common licenses
- `searchLicenses(query)` - Fuzzy search by name or ID
- `getLicenseById(id)` - Get license info by SPDX ID
- `isValidLicense(id)` - Validate a license ID

### 2. License Selection Modal

**File:** `obsidian-kadi4mat-sync/src/ui/LicenseSelectionModal.ts`

Obsidian `FuzzySuggestModal` that provides:
- Searchable list of all 80+ licenses
- Fuzzy matching on both name and SPDX ID
- Visual display with name + ID
- Keyboard navigation

```typescript
export class LicenseSelectionModal extends FuzzySuggestModal<LicenseInfo> {
  constructor(app: App, onSelect: (license: LicenseInfo) => void);
  // Modal automatically handles search, navigation, selection
}
```

### 3. Updated Sync Modal UI

**File:** `obsidian-kadi4mat-sync/src/ui/SyncModal.ts`

**License Selection Interface:**
1. **Dropdown:** Shows 13 common licenses for quick selection
2. **"Browse All..." Button:** Opens license selection modal with full list
3. **Current License Display:** Shows selected license if not in common list

**Common Licenses (Quick Access):**
- Academic Free License 3.0 (AFL-3.0)
- Apache Software License 2.0 (Apache-2.0)
- BSD 3-Clause License (BSD-3-Clause)
- CC0 1.0 Universal (CC0-1.0)
- Creative Commons Attribution 4.0 (CC-BY-4.0)
- Creative Commons Attribution-NonCommercial 4.0 (CC-BY-NC-4.0)
- Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC-BY-NC-SA-4.0)
- Creative Commons Attribution-ShareAlike 4.0 (CC-BY-SA-4.0)
- Eclipse Public License 2.0 (EPL-2.0)
- GNU General Public License 3.0 (GPL-3.0)
- GNU Lesser General Public License 3.0 (LGPL-3.0)
- MIT License (MIT)
- Mozilla Public License 2.0 (MPL-2.0)

## Bug Fixes

### State Dropdown Blank on Create

**Problem:** State dropdown appeared blank when opening modal for a new (unsynced) note.

**Root Cause:** Splitting dropdown setup into separate steps broke the value setting.

**Solution:** Reverted to chained method calls:
```typescript
// BEFORE (broken):
.addDropdown(dropdown => {
  dropdown
    .addOption('active', 'Active')
    .addOption('inactive', 'Inactive')
    .setValue(this.state);
  dropdown.onChange(...);
});

// AFTER (fixed):
.addDropdown(dropdown => dropdown
  .addOption('active', 'Active')
  .addOption('inactive', 'Inactive')
  .setValue(this.state)
  .onChange(...));
```

The key is that all dropdown configuration must be chained together in the callback.

## User Experience

### Creating a New Record

1. Open sync modal for unsynced note
2. **State dropdown** shows default value (e.g., "Active") ✅
3. **License dropdown** shows common licenses
4. Select from common list OR click "Browse All..."
5. If browsing:
   - Modal opens with full list
   - Type to search (e.g., "BSD", "public domain", "GPL")
   - Select desired license
   - Returns to sync modal with license selected

### Using License Browser

**Search Examples:**
- Type "BSD" → Shows all BSD variants
- Type "creative" → Shows all Creative Commons licenses
- Type "GPL" → Shows all GPL variants
- Type "MIT" → Directly finds MIT License
- Type "public" → Shows CC0 (Public Domain) and others

**Display Format:**
```
Creative Commons Attribution 4.0
CC-BY-4.0
```
↑ Name on top, SPDX ID below in monospace font

### Editing Existing Record

If record has a non-common license (e.g., "Unlicense"):
- Dropdown may not show it
- "Current License" section appears below showing full name + ID
- Can change to common license or browse for different one

## Complete License List

The system includes all 80+ licenses from Kadi4Mat:

**A-C:**
AAL, AFL-3.0, AGPL-3.0, APL-1.0, APSL-2.0, Apache-2.0, Artistic-2.0, BSD-2-Clause, BSD-3-Clause, BSL-1.0, CC0-1.0, CC-BY-4.0, CC-BY-NC-4.0, CC-BY-NC-SA-4.0, CC-BY-SA-4.0, CDDL-1.0, CECILL-2.1, CPAL-1.0, CPL-1.0, CATOSL-1.1, CUA-OPL-1.0

**E-H:**
ECL-2.0, EFL-2.0, EPL-2.0, EUDatagrid, EUPL-1.2, Entessa, FSFAP, Fair, Frameworx-1.0, GPL-2.0, GPL-3.0, LGPL-2.1, LGPL-3.0, HPND

**I-L:**
IPL-1.0, IPA, ISC, Intel, LPPL-1.3c, LiLiQ-P-1.1, LiLiQ-R-1.1, LiLiQ-Rplus-1.1, LPL-1.02

**M-P:**
MIT, MPL-2.0, MS-PL, MS-RL, MirOS, Motosoto, Multics, NASA-1.3, NCSA, NGPL, NPOSL-3.0, NTP, Naumen, Nokia, OCLC-2.0, ODbL-1.0, OFL-1.1, OGTSL, OSL-3.0, PHP-3.0, PostgreSQL, Python-2.0

**Q-Z:**
QPL-1.0, RPSL-1.0, RPL-1.5, RSCPL, SimPL-2.0, Sleepycat, SISSL, SPL-1.0, Watcom-1.0, UPL-1.0, Unlicense, VSL-1.0, W3C, Xnet, ZPL-2.0, Zlib, wxWindows

## Technical Details

### Why FuzzySuggestModal?

Obsidian's `FuzzySuggestModal` provides:
- Built-in fuzzy search algorithm
- Keyboard navigation (↑↓ arrows)
- Enter to select, Esc to cancel
- Automatic filtering as user types
- Handles large lists efficiently

### License Validation

The kadi4mat-client now provides validation:
```typescript
import { isValidLicense } from 'kadi4mat-client';

if (!isValidLicense(userInput)) {
  // Show error - invalid license
}
```

This prevents submission errors due to typos or unsupported licenses.

### Search Implementation

```typescript
getItemText(license: LicenseInfo): string {
  // Both name and ID searchable
  return `${license.name} (${license.id})`;
}
```

Users can search by:
- Full name: "Creative Commons Attribution"
- Partial name: "Creative", "Commons", "Attribution"
- SPDX ID: "CC-BY-4.0"
- Partial ID: "CC-BY", "CC"

## Testing Checklist

### State Dropdown
- [x] Shows "Active" for new records with default state = active
- [x] Shows "Inactive" when default state = inactive
- [x] Shows correct state when editing existing records
- [x] Dropdown not blank on open

### License Dropdown
- [x] Shows 13 common licenses
- [x] Default license selected (CC-BY-4.0)
- [x] Can select different common license
- [x] Selection updates license value

### License Browser
- [x] "Browse All..." button opens modal
- [x] Modal shows all 80+ licenses
- [x] Search filters licenses as typed
- [x] Selecting license closes modal and updates value
- [x] ESC closes modal without changing selection

### Custom License Display
- [x] Hidden when common license selected
- [x] Shows when non-common license selected
- [x] Displays full name + SPDX ID
- [x] Updates when license changed

### License Search
- [x] Search by full name works
- [x] Search by partial name works
- [x] Search by SPDX ID works
- [x] Search by partial ID works
- [x] Case-insensitive search
- [x] Multiple matches shown

### Validation
- [x] Only valid licenses can be selected
- [x] Cannot submit with invalid license
- [x] Browser ensures only valid selections

## Files Modified

1. **`kadi4mat-client/src/data/licenses.ts`** ✨ NEW
   - Complete license list (80+ licenses)
   - Helper functions for search/validation
   - Common license subset

2. **`kadi4mat-client/src/index.ts`**
   - Export license data and functions
   - Available to all clients using the library

3. **`obsidian-kadi4mat-sync/src/ui/LicenseSelectionModal.ts`** ✨ NEW
   - FuzzySuggestModal implementation
   - Searchable license selection
   - Styled suggestion rendering

4. **`obsidian-kadi4mat-sync/src/ui/SyncModal.ts`**
   - Import license functions from kadi4mat-client
   - Replace custom text input with dropdown + browser
   - Fix state dropdown to use chained methods
   - Add license display for non-common licenses
   - Add CSS styles for license modal

## Benefits

### For Users
✅ No risk of typos in license IDs
✅ Browse all available licenses easily
✅ Fast search to find specific licenses
✅ See full license names, not just codes
✅ Quick access to common licenses

### For Developers
✅ Centralized license data in client library
✅ Reusable across different projects
✅ Built-in validation
✅ Easy to update when Kadi4Mat adds licenses
✅ Type-safe license handling

### For Data Quality
✅ Only valid licenses can be submitted
✅ Consistent SPDX identifiers
✅ No more "Bad Request" due to invalid licenses
✅ Better metadata quality in Kadi4Mat

## Future Enhancements

**Possible Improvements:**
1. Group licenses by category (Permissive, Copyleft, Creative Commons, etc.)
2. Show license descriptions in modal
3. Add links to full license text
4. Recently used licenses at top
5. Favorite/starred licenses
6. License comparison tool
7. Suggest licenses based on project type

**API Updates:**
If Kadi4Mat API changes:
1. Update `KADI_LICENSES` array in kadi4mat-client
2. Rebuild client: `npm run build`
3. Rebuild plugin: `npm run dev`
4. No code changes needed in plugin!
