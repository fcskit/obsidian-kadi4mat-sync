import { App, FuzzySuggestModal } from 'obsidian';
import { KADI_LICENSES, type LicenseInfo } from 'kadi4mat-client';

/**
 * Modal for selecting a license from the complete Kadi4Mat license list
 * Provides fuzzy search across license names and SPDX IDs
 */
export class LicenseSelectionModal extends FuzzySuggestModal<LicenseInfo> {
	private onSelect: (license: LicenseInfo) => void;
	private allLicenses: LicenseInfo[];

	constructor(app: App, onSelect: (license: LicenseInfo) => void) {
		super(app);
		this.onSelect = onSelect;
		this.allLicenses = KADI_LICENSES;

		// Customize modal appearance
		this.setPlaceholder('Search licenses by name or SPDX identifier...');
		this.setInstructions([
			{ command: '↑↓', purpose: 'navigate' },
			{ command: '↵', purpose: 'select' },
			{ command: 'esc', purpose: 'dismiss' },
		]);
	}

	getItems(): LicenseInfo[] {
		return this.allLicenses;
	}

	getItemText(license: LicenseInfo): string {
		// Return text for fuzzy matching
		// Include both name and ID for better search results
		return `${license.name} (${license.id})`;
	}

	renderSuggestion(item: { item: LicenseInfo }, el: HTMLElement): void {
		const license = item.item;
		el.addClass('kadi-license-suggestion');

		// Create container for license info
		const container = el.createDiv({ cls: 'kadi-license-container' });

		// License name (main text)
		const nameEl = container.createDiv({ cls: 'kadi-license-name' });
		nameEl.setText(license.name);

		// SPDX ID (secondary text)
		const idEl = container.createDiv({ cls: 'kadi-license-id' });
		idEl.setText(license.id);
	}

	onChooseItem(license: LicenseInfo): void {
		this.onSelect(license);
	}
}
