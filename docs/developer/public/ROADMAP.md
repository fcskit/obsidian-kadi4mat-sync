# Obsidian Kadi4Mat Sync - Project Roadmap

## Current Version: v0.1.0 (Initial Release)

This is the first public release of the Obsidian Kadi4Mat Sync plugin.

---

## ✅ Recently Completed

### v0.1.0 - Initial Implementation (February 2025)
- ✅ Core sync functionality (Obsidian notes → Kadi4Mat records)
- ✅ Frontmatter metadata conversion to Kadi4Mat extras format
- ✅ Special handling for `{value, unit}` format (from ELN plugin)
- ✅ License selection system with 80+ SPDX licenses
- ✅ Fuzzy search modal for license browsing
- ✅ Dropdown with 13 common licenses for quick access
- ✅ Sync modal UI with validation
- ✅ Integration with kadi4mat-client library
- ✅ CORS-compatible API requests
- ✅ Field format fixes (identifier, state, visibility, license)
- ✅ GitHub Pages documentation site
- ✅ Clean project structure with docs/ organization

---

## 📋 Upcoming Features

### v0.2.0 - UI Improvements & Bug Fixes (Planned - Q1 2025)

**Priority: High**

**Bug Fixes:**
- [ ] Fix state dropdown visual glitch (appears blank on modal open)
  - Dropdown correctly sets value but appears empty initially
  - Non-critical but affects user experience
  - Status: Deferred from v0.1.0

**UI Enhancements:**
- [ ] Add sync status indicators in file explorer
- [ ] Show sync history for notes
- [ ] Visual feedback during sync operations
- [ ] Better error messages in UI

**Status:** Planned for next sprint

---

### v0.3.0 - Batch Operations (Planned - Q2 2025)

**Priority: Medium**

**Batch Sync Features:**
- [ ] Command to sync entire folder
- [ ] Command to sync all notes with specific tag
- [ ] Selective sync (checkbox list of notes)
- [ ] Progress bar for batch operations
- [ ] Bulk update support (sync changes to existing records)

**Smart Sync:**
- [ ] Track which notes have been synced
- [ ] Only sync modified notes (incremental sync)
- [ ] Conflict detection and resolution

**Status:** Design phase

---

### v0.4.0 - Advanced Features (Planned - Q2 2025)

**Priority: Medium**

**Bidirectional Sync:**
- [ ] Pull changes from Kadi4Mat back to Obsidian
- [ ] Sync record metadata updates to frontmatter
- [ ] Handle conflicts between local and remote changes

**File Attachments:**
- [ ] Automatically upload embedded images
- [ ] Support for PDF and other file attachments
- [ ] Handle file updates and deletions

**Templates:**
- [ ] Kadi4Mat template selection in sync modal
- [ ] Map Obsidian templates to Kadi4Mat templates
- [ ] Validate metadata against template requirements

**Status:** Under consideration

---

### v0.5.0 - Collections & Advanced Organization (Planned - Q3 2025)

**Priority: Low**

**Collection Management:**
- [ ] Assign records to collections during sync
- [ ] Browse and search collections
- [ ] Create collections from Obsidian

**Search Integration:**
- [ ] Search Kadi4Mat records from Obsidian
- [ ] Insert links to Kadi4Mat records in notes
- [ ] Quick preview of Kadi4Mat records

**Status:** Future consideration

---

## 🔮 Future Considerations

### v1.0.0 and Beyond

**Potential Features (Not Committed):**
- Automatic sync on note save (with debouncing)
- Sync profiles (different Kadi4Mat instances)
- Workspace-level sync settings
- Custom metadata mapping rules
- Integration with other Obsidian plugins (e.g., Dataview)
- Mobile app support (if feasible)
- Offline sync queue
- Version history and rollback

---

## 📊 Development Priorities

### Current Focus
1. **Bug Fixes** - Fix state dropdown visual glitch
2. **Documentation** - Complete user guide with screenshots
3. **Testing** - Manual testing in various scenarios

### Next Quarter
1. **Batch Operations** - Sync multiple notes at once
2. **Smart Sync** - Track synced notes, incremental updates
3. **User Feedback** - Gather feedback from early adopters

---

## 🐛 Known Issues

See [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for current bugs and limitations.

---

## 📝 Version History

| Version | Release Date | Highlights |
|---------|-------------|------------|
| v0.1.0  | Feb 2025    | Initial release, basic sync functionality |

---

## 🤝 Contributing

Interested in contributing? Check out:
- [Developer Guide](README.md)
- [Current Roadmap](#-upcoming-features) (see above)
- [Known Issues](KNOWN-ISSUES.md)

We welcome:
- Bug reports and fixes
- Feature requests and implementations
- UI/UX improvements
- Documentation improvements
- Testing and feedback

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

- Check if it's already on the roadmap
- Open a GitHub issue with the "enhancement" label
- Describe your use case and how it would help

---

**Last Updated:** February 2025
