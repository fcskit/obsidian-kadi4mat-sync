# Obsidian Kadi4Mat Sync - Known Issues

This document tracks known bugs, limitations, and areas for improvement in the Obsidian Kadi4Mat Sync plugin.

---

## 🐛 Active Bugs

### State Dropdown Visual Glitch
- **Severity:** Low (cosmetic issue, functionality works)
- **Description:** The state dropdown appears blank when the sync modal opens for new notes, even though the correct value is set
- **Impact:** User sees empty dropdown initially but can select a value normally
- **Workaround:** Simply click the dropdown - it works correctly despite appearing blank
- **Status:** Deferred to v0.2.0
- **Technical Details:** Dropdown value setting may need delayed initialization or different Obsidian API usage

---

## ⚠️ Limitations

### Sync Direction
- **One-way sync only** (Obsidian → Kadi4Mat)
  - Cannot pull changes from Kadi4Mat back to Obsidian
  - No conflict detection for remote changes
  - **Impact:** Manual coordination needed if editing records in Kadi4Mat
  - **Planned Fix:** v0.4.0 - Bidirectional sync

### File Attachments
- **No automatic attachment sync**
  - Embedded images and files are not uploaded
  - Links to attachments may break in Kadi4Mat
  - **Workaround:** Manually upload files to Kadi4Mat record
  - **Planned Fix:** v0.4.0 - Automatic file attachment handling

### Batch Operations
- **Single note sync only**
  - Cannot sync multiple notes at once
  - No folder-level or tag-based bulk sync
  - **Impact:** Must sync notes one by one
  - **Planned Fix:** v0.3.0 - Batch sync commands

### Sync Tracking
- **No record of synced notes**
  - Plugin doesn't track which notes have been synced
  - Cannot detect if note has been modified since last sync
  - **Impact:** Must manually remember what's been synced
  - **Planned Fix:** v0.3.0 - Smart sync with tracking

---

## 🚧 Technical Debt

### Testing
- **No automated tests**
  - Plugin is manually tested but lacks test suite
  - **Impact:** Potential regressions in future updates
  - **Planned Fix:** v0.2.0 - Add integration tests

### Error Handling
- **Generic error messages**
  - Some errors don't provide enough context for troubleshooting
  - **Impact:** Harder to debug sync failures
  - **Planned Fix:** v0.2.0 - Improve error messages and logging

### UI Polish
- **Basic UI design**
  - Modal could use better layout and styling
  - No visual feedback during sync operation
  - **Impact:** Less polished user experience
  - **Planned Fix:** v0.2.0 - UI enhancements

---

## 📌 Design Considerations

### Metadata Conversion
- **Type inference for metadata**
  - Plugin automatically detects types (string, number, boolean)
  - Some complex structures may not convert perfectly
  - **Consideration:** May need manual metadata mapping in future

### License Validation
- **Static license list**
  - License list is from kadi4mat-client library
  - No runtime validation against Kadi4Mat server
  - **Impact:** If Kadi4Mat adds new licenses, library update required
  - **Consideration:** Low priority - Kadi4Mat license list is stable

### API Token Storage
- **Plaintext storage in plugin settings**
  - PAT token stored in Obsidian's plugin settings (JSON file)
  - Obsidian does not provide secure credential storage
  - **Security Note:** Token file is accessible on filesystem
  - **Recommendation:** Use vault encryption or secure device

---

## 🔍 Areas for Investigation

### Performance
- **Large note handling**
  - Not tested with very large notes (>1MB)
  - May need optimization for performance
  - **Investigation Needed:** Test with large documents

### Obsidian API Usage
- **Dropdown component behavior**
  - State dropdown glitch may indicate Obsidian API quirk
  - Need to investigate proper dropdown initialization
  - **Investigation Needed:** Review Obsidian plugin examples

### Metadata Edge Cases
- **Complex frontmatter structures**
  - Deeply nested objects may not convert perfectly
  - Arrays of objects need testing
  - **Investigation Needed:** Test with various metadata structures

---

## ✅ Recently Fixed

### v0.1.0 Release Fixes
- ✅ **CORS errors** - Fixed by using proper Kadi4Mat API endpoints
- ✅ **Bad Request (400) errors** - Fixed field format issues (identifier, state, visibility)
- ✅ **License validation errors** - Implemented license selection system
- ✅ **Unit format handling** - Special conversion for `{value, unit}` format
- ✅ **Modal width** - Fixed container sizing (650px)
- ✅ **License dropdown ordering** - Alphabetical sorting

---

## 📋 Reporting Issues

If you encounter a bug or limitation not listed here:

1. **Check if it's already known** by reviewing this document
2. **Search existing GitHub issues** to avoid duplicates
3. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Obsidian version and OS
   - Screenshots if applicable
   - Sample note (redact sensitive data)

---

## 🔄 Issue Lifecycle

**Reported** → **Confirmed** → **Prioritized** → **Fixed** → **Released**

We track issues using:
- This document for known limitations and design considerations
- GitHub Issues for user-reported bugs
- ROADMAP.md for planned features and fixes

---

## 🛡️ Security Considerations

### API Token Security
- Store PAT token securely
- Do not share vault with embedded token
- Revoke token if compromised
- Use read/write permissions only (not admin)

### Data Privacy
- Plugin sends note content to Kadi4Mat server
- Review metadata before syncing
- Be aware of license and visibility settings
- Kadi4Mat may have data retention policies

---

**Last Updated:** February 2025
