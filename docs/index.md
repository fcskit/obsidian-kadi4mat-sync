---
layout: default
title: Obsidian Kadi4Mat Sync Plugin
---

# Obsidian Kadi4Mat Sync Plugin

Seamlessly sync your [Obsidian](https://obsidian.md/) notes to the [Kadi4Mat](https://kadi.iam.kit.edu/) research data repository platform.

## Overview

This plugin allows you to sync note metadata and content from Obsidian to Kadi4Mat records, enabling:
- **Automated metadata extraction** from YAML frontmatter
- **Unit-aware data conversion** (e.g., `{value: 2, unit: "K/min"}`)
- **Bidirectional sync** - Update existing Kadi4Mat records
- **License management** with built-in SPDX license browser
- **Flexible visibility** and state control

## Features

### 📝 Metadata Sync
- Extract frontmatter from Obsidian notes
- Convert nested objects and arrays automatically
- Preserve units on numeric values
- Add contextual information (vault name, file path, timestamps)

### 🔍 License Browser
- Search through 80+ supported SPDX licenses
- Fuzzy search by license name or ID
- Quick access to common licenses
- Validated license selection (no typos!)

### 🎯 Smart Sync
- Create new Kadi4Mat records from notes
- Update existing records
- Visual sync dialog with live preview
- Debug logging for troubleshooting

### 🔒 Flexible Control
- Choose record state (active/inactive)
- Set visibility (private/public)
- Override record title
- Full control over what gets synced

## Quick Start

### Installation

1. Download the latest release
2. Extract to your vault's `.obsidian/plugins/` folder
3. Enable the plugin in Obsidian settings

### Configuration

1. Open plugin settings
2. Enter your Kadi4Mat instance URL
3. Add your personal access token
4. Set default state and visibility preferences

### First Sync

1. Open a note with frontmatter
2. Run command: `Kadi4Mat: Sync current note`
3. Configure sync options in the dialog
4. Click "Create Record"
5. The note's frontmatter is updated with Kadi4Mat record info

## Example Usage

**Before sync** - Note with frontmatter:
```yaml
---
title: TGA Measurement - Sample A
temperature: {value: 800, unit: "°C"}
heating_rate: {value: 2, unit: "K/min"}
experimenter: Jane Smith
tags:
  - TGA
  - thermal-analysis
---

# Measurement Results
...
```

**After sync** - Frontmatter updated:
```yaml
---
title: TGA Measurement - Sample A
temperature: {value: 800, unit: "°C"}
heating_rate: {value: 2, unit: "K/min"}
experimenter: Jane Smith
tags:
  - TGA
  - thermal-analysis
kadi_record_id: 12345
kadi_identifier: tga-measurement-sample-a-2026-02-12
kadi_url: https://kadi.iam.kit.edu/records/12345
---
```

**In Kadi4Mat** - Record created with extras:
```json
{
  "title": "TGA Measurement - Sample A",
  "state": "active",
  "visibility": "private",
  "extras": [
    {"key": "temperature", "type": "int", "value": 800, "unit": "°C"},
    {"key": "heating_rate", "type": "int", "value": 2, "unit": "K/min"},
    {"key": "experimenter", "type": "str", "value": "Jane Smith"},
    {"key": "obsidian_vault", "type": "str", "value": "MyVault"},
    {"key": "obsidian_filename", "type": "str", "value": "path/to/note.md"}
  ]
}
```

## Documentation

- **[Installation Guide](user/installation.html)** - Detailed setup instructions
- **[Usage Guide](user/usage.html)** - How to sync notes and use features
- **[Developer Guide](developer/public/)** - Contributing and development

## Technical Details

### Built With
- **[kadi4mat-client](https://github.com/fcskit/kadi4mat-client)** - TypeScript client for Kadi4Mat API
- **Obsidian API** - Plugin development framework
- **TypeScript** - Type-safe development

### Architecture
- Modular design with separate sync engine and UI
- CORS-compatible fetch implementation for Electron
- Comprehensive error handling and logging
- Extensible metadata conversion system

## Repository

- **GitHub:** [https://github.com/fcskit/obsidian-kadi4mat-sync](https://github.com/fcskit/obsidian-kadi4mat-sync)
- **Issues:** [Report bugs or request features](https://github.com/fcskit/obsidian-kadi4mat-sync/issues)
- **License:** MIT

## Related Projects

- **[Kadi4Mat TypeScript Client](https://github.com/fcskit/kadi4mat-client)** - Underlying API client library
- **[Obsidian ELN Plugin](https://github.com/fcskit/obsidian-eln-plugin)** - Electronic Lab Notebook for Obsidian
- **[Kadi4Mat](https://kadi.iam.kit.edu/)** - Research data repository platform

## Support

- 📖 [User Guide](user/usage.html)
- 💬 [GitHub Discussions](https://github.com/fcskit/obsidian-kadi4mat-sync/discussions)
- 🐛 [Issue Tracker](https://github.com/fcskit/obsidian-kadi4mat-sync/issues)
