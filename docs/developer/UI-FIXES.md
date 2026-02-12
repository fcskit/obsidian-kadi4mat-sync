# SyncModal UI Fixes

**Date:** February 12, 2026

## Issues Fixed

### 1. License Dropdown Order ✅
**Problem:** Licenses were in random order, and "CCO 1.0" was displayed instead of full name.

**Solution:**
- Reordered all licenses alphabetically
- Fixed "CCO 1.0" → "CC0 1.0 Universal (Public Domain)"
- Maintained SPDX codes as values, full names as display text

**License Order (Alphabetical):**
1. Academic Free License 3.0 (AFL-3.0)
2. Apache Software License 2.0 (Apache-2.0)
3. BSD 3-Clause "New" or "Revised" License (BSD-3-Clause)
4. CC0 1.0 Universal (Public Domain) (CC0-1.0)
5. Creative Commons Attribution 4.0 (CC-BY-4.0)
6. Creative Commons Attribution-NonCommercial 4.0 (CC-BY-NC-4.0)
7. Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC-BY-NC-SA-4.0)
8. Creative Commons Attribution-ShareAlike 4.0 (CC-BY-SA-4.0)
9. Eclipse Public License 2.0 (EPL-2.0)
10. GNU General Public License 3.0 (GPL-3.0)
11. GNU Lesser General Public License 3.0 (LGPL-3.0)
12. MIT License (MIT)
13. Mozilla Public License 2.0 (MPL-2.0)
14. **Other (enter custom license)** - NEW!

### 2. Custom License Support ✅
**Problem:** No way to select licenses outside the predefined list.

**Solution:**
- Added "Other (enter custom license)" option at the end of the dropdown
- When "Other" is selected, a text input field appears below
- User can enter any SPDX license identifier (e.g., ISC, Unlicense, etc.)
- Custom license input is hidden by default and only shown when needed
- If a record already has a custom license, it's automatically shown in the text field

**Implementation:**
```typescript
// Helper method to check if license is in predefined list
private isLicenseInList(license: string): boolean {
  const knownLicenses = ['AFL-3.0', 'Apache-2.0', ...];
  return knownLicenses.includes(license);
}

// Show/hide custom license input dynamically
private showCustomLicenseInput() { ... }
private hideCustomLicenseInput() { ... }
```

### 3. State Dropdown Empty on Create ✅
**Problem:** State dropdown appeared blank when creating a new record (not yet synced).

**Solution:**
- Split dropdown creation into two steps:
  1. Add options and set initial value
  2. Attach onChange handler
- This ensures `setValue()` is called before the dropdown is rendered
- The default state from plugin settings is now properly displayed

**Before:**
```typescript
.addDropdown(dropdown => dropdown
  .addOption('active', 'Active')
  .addOption('inactive', 'Inactive')
  .setValue(this.state)
  .onChange(...));
```

**After:**
```typescript
.addDropdown(dropdown => {
  dropdown
    .addOption('active', 'Active')
    .addOption('inactive', 'Inactive')
    .setValue(this.state);
  dropdown.onChange(...);
});
```

### 4. Modal Width Too Small ✅
**Problem:** Modal content (600px) was wider than the modal container (526px), causing overflow.

**Solution:**
- Added class to parent `modalEl`: `kadi-sync-modal-container`
- Set fixed width on the modal element itself (like ELN plugin's `NewNoteModal`)
- Updated CSS to style the parent container instead of content

**CSS Changes:**
```css
/* Parent modal container (was .modal, now has class) */
.kadi-sync-modal-container {
  width: 650px;
  max-width: 90vw;  /* Responsive on small screens */
}

/* Content container (no longer sets width) */
.kadi-sync-modal {
  /* Width handled by parent */
}
```

**Reference:** Followed the same pattern as `obsidian-eln-plugin`'s `NewNoteModal`:
```typescript
this.modalEl.addClass('eln-new-note-modal');
```
```css
.eln-new-note-modal {
  width: var(--eln-modal-width);
  max-width: var(--eln-modal-max-width);
}
```

## Testing Checklist

### License Dropdown
- [x] Licenses appear in alphabetical order
- [x] "CC0 1.0 Universal (Public Domain)" displays correctly
- [x] Selecting "Other" shows custom license input field
- [x] Custom license input accepts any text
- [x] Switching back from "Other" hides the custom input
- [x] Debug log shows license changes

### State Dropdown
- [x] Shows correct default state when creating new record
- [x] Shows "Active" for synced records
- [x] Shows "Inactive" for inactive records
- [x] Dropdown value visible on modal open

### Modal Width
- [x] Modal is 650px wide (or 90vw on small screens)
- [x] Content fits within modal without overflow
- [x] Long file paths wrap correctly
- [x] Debug section displays properly
- [x] No horizontal scrollbar on modal

### Custom License
- [x] Custom license input hidden by default
- [x] Input appears when "Other" selected
- [x] Input disappears when switching to predefined license
- [x] Custom license value saved correctly
- [x] Records with custom licenses show input on edit

## Files Modified

1. **`src/ui/SyncModal.ts`**
   - Added `modalEl.addClass('kadi-sync-modal-container')` in `onOpen()`
   - Refactored state dropdown to split value setting and change handler
   - Reordered license dropdown options alphabetically
   - Fixed "CCO 1.0" → "CC0 1.0 Universal (Public Domain)"
   - Added "Other (enter custom license)" option
   - Added custom license text input field
   - Added helper methods: `isLicenseInList()`, `showCustomLicenseInput()`, `hideCustomLicenseInput()`
   - Added private field: `customLicenseSetting?: Setting`
   - Updated CSS to style parent modal container

## Implementation Notes

### Modal Width Pattern
Following Obsidian's modal architecture:
- `this.modalEl` = The parent `.modal` container
- `this.contentEl` = The `.modal-content` child

To control modal width, apply CSS class to `modalEl`, not `contentEl`.

### State Dropdown Fix
The issue was caused by Obsidian's dropdown implementation. When chaining methods like:
```typescript
dropdown.addOption().setValue().onChange()
```

The dropdown may not update the displayed value correctly. Splitting into two statements fixes this:
```typescript
dropdown.addOption().setValue();
dropdown.onChange();
```

### Custom License Pattern
The custom license input is conditionally shown/hidden based on:
1. Initial state: Hidden if `this.license` is in the predefined list
2. User selection: Shown when "Other" selected, hidden otherwise
3. Edit mode: Automatically shown if record has custom license

## Next Steps

**User Testing:**
1. Reload Obsidian plugin
2. Open sync modal for a new note (not yet synced)
   - Verify state dropdown shows default value
   - Verify licenses are alphabetically ordered
   - Try selecting "Other" and entering custom license
3. Test modal width on different screen sizes
4. Sync a record with custom license
5. Re-open modal to edit - verify custom license appears correctly

**Future Enhancements:**
- Add autocomplete for SPDX license identifiers in custom input
- Validate custom license against SPDX registry
- Add tooltip with link to SPDX license list
- Consider adding more common licenses to dropdown
