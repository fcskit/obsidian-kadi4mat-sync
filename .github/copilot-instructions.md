# Obsidian Kadi4Mat Sync Plugin - Copilot Instructions

This is an Obsidian plugin that enables syncing notes to the Kadi4Mat scientific data repository platform.

## Project Structure and File Placement Guidelines

### Source Code Organization

- **`src/`** - All TypeScript source code
  - `src/main.ts` - Plugin entry point
  - `src/modals/` - Modal dialogs and UI components
    - `src/modals/SyncModal.ts` - Main sync dialog
    - `src/modals/LicenseSelectionModal.ts` - License browser
  - `src/settings/` - Plugin settings and configuration
  - `src/sync/` - Sync logic and API integration
  - `src/utils/` - Utility functions and helpers

### Testing

- **`test-vault/`** - Test Obsidian vault for development and testing
  - Contains sample notes for testing sync functionality
  - Test metadata structures
  - Can be opened in Obsidian for manual testing

### Documentation

- **`docs/`** - All documentation files
  - `docs/user/` - User-facing documentation (installation, features, guides)
    - **Published on GitHub Pages** - Visible to all users
  - `docs/examples/` - Example workflows and usage patterns
    - **Published on GitHub Pages** - Visible to all users
  - `docs/developer/` - Developer documentation
    - `docs/developer/public/` - **PUBLIC DEVELOPER DOCS** (Published on GitHub Pages)
      - Contains: README.md, ROADMAP.md, KNOWN-ISSUES.md
      - Visible to users and contributors on documentation site
    - All other `docs/developer/` files are **INTERNAL ONLY**
      - Available in git repository for contributors
      - Hidden from GitHub Pages (excluded in `docs/_config.yml`)
  - `docs/_config.yml` - Jekyll configuration for GitHub Pages
  - `docs/_layouts/` - Jekyll templates (if needed)

### Developer Documentation Organization (CRITICAL)

The `docs/developer/` directory has a **two-tier organizational structure**:

#### Public Developer Documentation (Published on GitHub Pages)

**`docs/developer/public/`** - **PUBLICLY VISIBLE ON DOCUMENTATION SITE**
- `public/README.md` - Developer documentation index and contributing guide
- `public/ROADMAP.md` - Project roadmap and version planning
- `public/KNOWN-ISSUES.md` - Known bugs and limitations

**Purpose**: Information useful for users, potential contributors, and the community
**Visibility**: Published at https://fcskit.github.io/obsidian-kadi4mat-sync/developer/public/

#### Internal Developer Documentation (Hidden from GitHub Pages)

All other files in `docs/developer/` are **INTERNAL ONLY**:
- Available in the git repository for active contributors
- Hidden from GitHub Pages (excluded in `docs/_config.yml`)
- Visible to anyone who clones the repository

**When to create files in `docs/developer/` (internal only):**
- Implementation notes and decisions
- Bug fix documentation
- Build system details
- CORS troubleshooting
- API integration notes
- UI fix documentation

### Build and Configuration

- **Root directory** - Build scripts and configuration files
  - `package.json` - Dependencies and scripts
  - `tsconfig.json` - TypeScript configuration
  - `manifest.json` - Obsidian plugin manifest
  - `esbuild.config.mjs` - Build script
  - `versions.json` - Version compatibility matrix
  - `styles.css` - Compiled CSS output (generated)

### Assets and Resources

- **`images/`** - Screenshots and visual assets for documentation

## File Creation Guidelines

### When creating new files:

1. **TypeScript source files** → Always place in appropriate `src/` subdirectory
2. **Test vault content** → Place in `test-vault/` directory
3. **User documentation** → Place in `docs/user/`
4. **Examples** → Place in `docs/examples/`
5. **Developer notes** → Place in `docs/developer/` (internal only)
6. **Public developer docs** → Place in `docs/developer/public/`
7. **Configuration files** → Root directory only if they affect the entire project

### Naming Conventions

- Use PascalCase for class files (e.g., `SyncModal.ts`, `LicenseSelectionModal.ts`)
- Use camelCase for utility files (e.g., `syncUtils.ts`)
- Use kebab-case for directories
- Documentation files use `.md` extension
- Test notes can use any Obsidian-compatible format

## CRITICAL: Never Create Documentation in Root

**❌ NEVER DO THIS:**
```
obsidian-kadi4mat-sync/
├── CORS-FIX.md              ❌ NO!
├── BUILD-SYSTEM.md          ❌ NO!
├── FIELD-VALUES-FIX.md      ❌ NO!
```

**✅ ALWAYS DO THIS:**
```
obsidian-kadi4mat-sync/
├── README.md                ✅ Only this in root
├── LICENSE                  ✅ License file
├── manifest.json            ✅ Plugin manifest
├── docs/
│   └── developer/
│       ├── CORS-FIX.md              ✅ Internal doc
│       ├── BUILD-SYSTEM.md           ✅ Internal doc
│       ├── FIELD-VALUES-FIX.md       ✅ Internal doc
│       └── public/
│           ├── README.md             ✅ Public dev doc
│           └── ROADMAP.md            ✅ Public roadmap
```

### Rules for New Documentation

**BEFORE creating ANY new .md file, ask yourself:**

1. **Is this user-facing documentation?**
   - YES → Goes in `docs/user/`
   - Will be visible on GitHub Pages

2. **Is this an example workflow?**
   - YES → Goes in `docs/examples/`
   - Will be visible on GitHub Pages

3. **Is this for potential contributors (public)?**
   - YES → Goes in `docs/developer/public/`
   - Will be visible on GitHub Pages

4. **Is this internal implementation notes?**
   - YES → Goes in `docs/developer/` (not in public/)
   - Hidden from GitHub Pages, available in git repo

5. **Is it the main README?**
   - YES → Only `README.md` belongs in root
   - Update it, don't create new files

### Architecture Notes

This is an Obsidian plugin that:
- Syncs Obsidian notes to Kadi4Mat as records
- Converts frontmatter metadata to Kadi4Mat format
- Handles file attachments and links
- Provides UI for license selection and sync configuration
- Uses the kadi4mat-client library for API communication
- Follows Obsidian plugin development patterns

### Key Technical Details

**Metadata Conversion:**
- Obsidian frontmatter → Kadi4Mat extras format
- Special handling for `{value, unit}` format
- Automatic type detection (string, number, boolean, array)

**License Management:**
- 80+ SPDX licenses supported
- Dropdown with 13 common licenses
- Fuzzy search modal for all licenses
- Validation against Kadi4Mat's accepted list

**UI Components:**
- `SyncModal` - Main sync dialog
- `LicenseSelectionModal` - License browser (extends `FuzzySuggestModal`)
- Custom dropdowns and inputs using Obsidian API

### Development Workflow

- Use the build scripts in package.json for development
- `npm run build` - Full production build
- `npm run dev` - Development build (manual reload required)
- Test in Obsidian by symlinking plugin to vault's `.obsidian/plugins/` folder
- The plugin follows Obsidian's plugin development patterns
- All UI components should integrate with Obsidian's theming system

### Styling Guidelines

**CRITICAL: Never Hardcode CSS in TypeScript**

This plugin uses a proper `styles.css` file for all static styling. **Never** inject styles dynamically in TypeScript code.

**❌ NEVER DO THIS:**
```typescript
// DON'T create styles dynamically
const style = document.createElement('style');
style.textContent = `...`;
document.head.appendChild(style);

// DON'T hardcode style values in TypeScript
element.style.width = '650px';
element.style.padding = '1em';
```

**✅ ALWAYS DO THIS:**
```css
/* Put all static styles in styles.css */
.my-component {
	width: 650px;
	padding: 1em;
}
```

```typescript
// Use CSS classes in TypeScript
element.addClass('my-component');
```

**When to use `.style` in TypeScript:**
- ✅ **Conditional display**: `element.style.display = 'none'` based on logic
- ✅ **Dynamic calculations**: Width based on user input or runtime data
- ✅ **Programmatic state changes**: Show/hide, enable/disable based on conditions

**When to use `styles.css`:**
- ✅ **All static styling**: Colors, fonts, spacing, layout
- ✅ **Component dimensions**: Width, height, padding, margin
- ✅ **Visual design**: Backgrounds, borders, shadows, border-radius
- ✅ **Responsive design**: Media queries, flexible layouts
- ✅ **Typography**: Font sizes, weights, line heights

**Obsidian CSS Variables to Use:**

Always use Obsidian's CSS variables for theming compatibility:

- `var(--background-primary)` - Main background color
- `var(--background-secondary)` - Secondary background (cards, sections)
- `var(--background-modifier-border)` - Border colors
- `var(--text-normal)` - Normal text color
- `var(--text-muted)` - Muted/secondary text
- `var(--text-faint)` - Very light text
- `var(--font-monospace)` - Code/monospace font
- `var(--interactive-accent)` - Accent color (buttons, links)
- `var(--interactive-accent-hover)` - Accent hover state

**Why This Matters:**
1. **Separation of concerns** - CSS belongs in CSS files, not JavaScript
2. **Maintainability** - Easy to find and modify styles
3. **Performance** - No dynamic DOM manipulation needed
4. **Theming** - Users can customize via CSS snippets
5. **Standards** - Follows Obsidian plugin best practices

## TODO System Workflow

### Primary Reference for Work Planning

**ALWAYS check `docs/developer/public/ROADMAP.md` before starting work.**

The roadmap is the single source of truth for:
- What needs to be done
- What's currently being worked on
- What's been completed
- Version planning

### When Starting a New Feature or Task

1. **Check the roadmap first**:
   ```bash
   # Check what's planned
   cat docs/developer/public/ROADMAP.md
   ```

2. **Review public/KNOWN-ISSUES.md** to understand current limitations

3. **If creating a new feature**, update ROADMAP.md with:
   - Feature name and description
   - Target version
   - Priority (High/Medium/Low)
   - Implementation status

### When Completing a Feature

**CRITICAL**: Update these files for EVERY finished feature:

1. **Update ROADMAP.md**:
   - Move feature to "Completed" section
   - Add completion date
   - Link to relevant commits or PRs
   - Update version information

2. **Update KNOWN-ISSUES.md** if applicable:
   - Remove issues that were fixed
   - Add any new limitations discovered

3. **Update user documentation**:
   - Add to `docs/user/` if user-facing
   - Update examples if workflow changed
   - Update README.md if major feature

4. **Update manifest.json** if version changed

5. **Commit with clear message**:
   ```bash
   git commit -m "Add [feature-name]
   
   - Implemented X, Y, Z
   - Updated ROADMAP.md and manifest.json
   - Added user documentation"
   ```

## Keeping Documentation Organized

### The Problem We're Avoiding

Previously, root directories accumulated many unsorted `.md` files. **We now use a structured `docs/` folder.**

### Rules for New Documentation

**Before creating any documentation file:**

1. **Is this for users?** → `docs/user/`
2. **Is this an example?** → `docs/examples/`
3. **Is this for contributors?** → `docs/developer/public/`
4. **Is this internal notes?** → `docs/developer/` (not in public/)

**If unsure where a doc goes:**
- Check existing files in `docs/` subdirectories
- Look at ROADMAP.md to see where similar topics are referenced
- Ask: "Should this be on GitHub Pages?" 
  - YES → `docs/user/`, `docs/examples/`, or `docs/developer/public/`
  - NO → `docs/developer/`

## Important: Never place generated files in src/

- Build outputs are in root (`main.js`, `styles.css`)
- Test vault stays in `test-vault/`
- Never commit `node_modules/`
- Never commit user data or API keys
- `.env` files should never be committed (use `.env.example` for templates)