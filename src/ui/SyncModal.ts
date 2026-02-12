import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import type KadiMatSyncPlugin from '../main';
import { extractKadiFields, filterMetadata } from '../utils/frontmatter';
import { jsonToExtras, getCommonLicenses, getLicenseById } from 'kadi4mat-client';
import type { CreateRecordParams, UpdateRecordParams } from 'kadi4mat-client';
import { LicenseSelectionModal } from './LicenseSelectionModal';

/**
 * Modal dialog for configuring record sync to Kadi4Mat
 * Allows editing title, state, visibility, license and shows debug info
 */
export class SyncModal extends Modal {
	private plugin: KadiMatSyncPlugin;
	private file: TFile;
	private title: string;
	private state: 'active' | 'inactive';
	private visibility: 'private' | 'public';
	private license: string;
	private isUpdate: boolean;
	private recordId?: number;
	private debugMessages: string[] = [];
	private debugContainer?: HTMLElement;
	private licenseDisplaySetting?: Setting;
	private licenseDropdownSetting?: Setting;
	private settingsContainer?: HTMLElement;
	private onConfirm: (params: {
		title: string;
		state: 'active' | 'inactive';
		visibility: 'private' | 'public';
		license: string;
	}) => Promise<void>;

	constructor(
		app: App,
		plugin: KadiMatSyncPlugin,
		file: TFile,
		onConfirm: (params: {
			title: string;
			state: 'active' | 'inactive';
			visibility: 'private' | 'public';
			license: string;
		}) => Promise<void>
	) {
		super(app);
		this.plugin = plugin;
		this.file = file;
		this.onConfirm = onConfirm;

		// Extract initial values from frontmatter
		const metadata = this.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;
		const kadiFields = extractKadiFields(file, frontmatter);

		this.title = kadiFields.title || file.basename;
		this.state = (kadiFields.state as 'active' | 'inactive') || this.plugin.settings.defaultState;
		this.visibility = (kadiFields.visibility as 'private' | 'public') || this.plugin.settings.defaultVisibility;
		this.license = frontmatter?.kadi_license || 'CC-BY-4.0';
		this.isUpdate = !!kadiFields.recordId;
		this.recordId = kadiFields.recordId;

		this.addDebugMessage(`Initializing sync for: ${file.path}`);
		this.addDebugMessage(`Mode: ${this.isUpdate ? 'Update' : 'Create'}`);
		if (this.isUpdate) {
			this.addDebugMessage(`Record ID: ${this.recordId}`);
		}
	}

	private addDebugMessage(message: string) {
		const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
		const logMessage = `[${timestamp}] ${message}`;
		this.debugMessages.push(logMessage);
		
		if (this.debugContainer) {
			this.debugContainer.setText(this.debugMessages.join('\n'));
			// Auto-scroll to bottom
			this.debugContainer.scrollTop = this.debugContainer.scrollHeight;
		}
	}

	private isLicenseInList(license: string): boolean {
		const commonLicenses = getCommonLicenses();
		return commonLicenses.some((l) => l.id === license);
	}

	private updateLicenseDisplay() {
		if (!this.licenseDisplaySetting) return;

		const licenseInfo = getLicenseById(this.license);
		
		if (licenseInfo && !this.isLicenseInList(this.license)) {
			// Show custom license info
			this.licenseDisplaySetting.setDesc(`${licenseInfo.name} (${licenseInfo.id})`);
			this.licenseDisplaySetting.settingEl.style.display = '';
		} else {
			// Hide for common licenses
			this.licenseDisplaySetting.settingEl.style.display = 'none';
		}
	}

	private refreshLicenseDropdown() {
		// Force re-render by closing and reopening wouldn't work,
		// so we'll just update the display
		this.updateLicenseDisplay();
	}

	private customLicenseSetting?: Setting;

	private showCustomLicenseInput() {
		// No longer used - kept for compatibility
	}

	private hideCustomLicenseInput() {
		if (this.customLicenseSetting) {
			this.customLicenseSetting.settingEl.style.display = 'none';
		}
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('kadi-sync-modal');

		// Set modal width on parent container
		this.modalEl.addClass('kadi-sync-modal-container');

		// Title
		contentEl.createEl('h2', { text: this.isUpdate ? 'Update Kadi4Mat Record' : 'Create Kadi4Mat Record' });
		
		// File info
		contentEl.createEl('p', { 
			text: `File: ${this.file.path}`,
			cls: 'kadi-file-info'
		});

		if (this.isUpdate) {
			contentEl.createEl('p', { 
				text: `Record ID: ${this.recordId}`,
				cls: 'kadi-record-info'
			});
		}

		// Settings container
		const settingsContainer = contentEl.createDiv('kadi-settings-container');
		this.settingsContainer = settingsContainer;

		// Title setting
		new Setting(settingsContainer)
			.setName('Record Title')
			.setDesc('The title for the Kadi4Mat record')
			.addText(text => text
				.setPlaceholder('Enter record title')
				.setValue(this.title)
				.onChange(value => {
					this.title = value;
					this.addDebugMessage(`Title changed to: ${value}`);
				}));

		// State setting
		new Setting(settingsContainer)
			.setName('State')
			.setDesc('The publication state of the record')
			.addDropdown(dropdown => dropdown
				.addOption('active', 'Active')
				.addOption('inactive', 'Inactive')
				.setValue(this.state)
				.onChange((value: 'active' | 'inactive') => {
					this.state = value;
					this.addDebugMessage(`State changed to: ${value}`);
				}));

		// Visibility setting
		new Setting(settingsContainer)
			.setName('Visibility')
			.setDesc('Who can view this record')
			.addDropdown(dropdown => dropdown
				.addOption('private', 'Private - Only you')
				.addOption('public', 'Public - Everyone')
				.setValue(this.visibility)
				.onChange((value: 'private' | 'public') => {
					this.visibility = value;
					this.addDebugMessage(`Visibility changed to: ${value}`);
				}));

		// License setting - Common licenses dropdown
		this.licenseDropdownSetting = new Setting(settingsContainer)
			.setName('License')
			.setDesc('Select a common license or browse the full list');

		this.licenseDropdownSetting.addDropdown(dropdown => {
			const commonLicenses = getCommonLicenses();
			
			// Add common licenses
			commonLicenses.forEach(license => {
				dropdown.addOption(license.id, license.name);
			});

			// Set current value or default
			dropdown.setValue(this.license);
			
			dropdown.onChange(value => {
				this.license = value;
				this.updateLicenseDisplay();
				this.addDebugMessage(`License changed to: ${value}`);
			});
		});

		// Add "Browse All Licenses" button
		this.licenseDropdownSetting.addButton(button => button
			.setButtonText('Browse All...')
			.setTooltip('Browse complete list of Kadi4Mat licenses')
			.onClick(() => {
				const modal = new LicenseSelectionModal(this.app, (license) => {
					this.license = license.id;
					this.updateLicenseDisplay();
					this.addDebugMessage(`License selected from browser: ${license.id} (${license.name})`);
					// Rebuild the dropdown to show custom license
					this.refreshLicenseDropdown();
				});
				modal.open();
			}));

		// License display (for non-common licenses)
		this.licenseDisplaySetting = new Setting(settingsContainer)
			.setName('Current License')
			.setDesc('');
		
		// Initially hide if showing a common license
		this.updateLicenseDisplay();

		// Debug section
		contentEl.createEl('h3', { text: 'Debug Information' });
		
		const debugSection = contentEl.createDiv('kadi-debug-section');
		
		// Debug message container
		this.debugContainer = debugSection.createEl('pre', {
			cls: 'kadi-debug-messages'
		});
		this.debugContainer.setText(this.debugMessages.join('\n'));

		// Preview metadata button
		new Setting(debugSection)
			.setName('Preview Metadata')
			.setDesc('Show the metadata that will be sent to Kadi4Mat')
			.addButton(button => button
				.setButtonText('Preview')
				.onClick(() => this.previewMetadata()));

		// Save debug log button
		new Setting(debugSection)
			.setName('Save Debug Log')
			.setDesc('Save debug messages to a file for analysis')
			.addButton(button => button
				.setButtonText('Save Log')
				.onClick(() => this.saveDebugLog()));

		// Action buttons
		const buttonContainer = contentEl.createDiv('kadi-button-container');
		
		buttonContainer.createEl('button', {
			text: 'Cancel',
			cls: 'mod-cancel'
		}).addEventListener('click', () => {
			this.addDebugMessage('Sync cancelled by user');
			this.close();
		});

		buttonContainer.createEl('button', {
			text: this.isUpdate ? 'Update Record' : 'Create Record',
			cls: 'mod-cta'
		}).addEventListener('click', () => {
			this.confirmSync();
		});

		// Add styles
		this.addStyles();
	}

	private previewMetadata() {
		this.addDebugMessage('Generating metadata preview...');

		try {
			const metadata = this.app.metadataCache.getFileCache(this.file);
			const frontmatter = metadata?.frontmatter;
			
			// Extract and filter metadata
			const kadiFields = extractKadiFields(this.file, frontmatter);
			const customMetadata = filterMetadata(frontmatter || {});
			
			// Add context
			const metadataWithContext = {
				...customMetadata,
				obsidian_filename: this.file.path,
				obsidian_vault: this.app.vault.getName(),
				[this.isUpdate ? 'modified_date' : 'created_date']: new Date().toISOString(),
			};

			// Convert to extras
			const extras = jsonToExtras(metadataWithContext, {
				nestObjects: true,
				parseUnits: true,
			});

			// Build preview object
			const preview = {
				title: this.title,
				state: this.state,
				visibility: this.visibility,
				license: this.license,
				...(kadiFields.tags && kadiFields.tags.length > 0 && { tags: kadiFields.tags }),
				extras_count: extras.length,
				extras_sample: extras.slice(0, 3), // Show first 3 extras
			};

			this.addDebugMessage('--- Metadata Preview ---');
			this.addDebugMessage(JSON.stringify(preview, null, 2));
			this.addDebugMessage(`Total extras fields: ${extras.length}`);
			
			// Show more details about nested structures
			const nestedFields = extras.filter(e => e.type === 'dict' || e.type === 'list');
			if (nestedFields.length > 0) {
				this.addDebugMessage(`Nested structures: ${nestedFields.length}`);
				nestedFields.forEach(field => {
					this.addDebugMessage(`  - ${field.key} (${field.type})`);
				});
			}

		} catch (error) {
			this.addDebugMessage(`ERROR: Failed to preview metadata: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async saveDebugLog() {
		try {
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `kadi-sync-log-${timestamp}.txt`;
			
			const logContent = [
				'Kadi4Mat Sync Debug Log',
				'='.repeat(50),
				`Generated: ${new Date().toISOString()}`,
				`File: ${this.file.path}`,
				`Mode: ${this.isUpdate ? 'Update' : 'Create'}`,
				this.isUpdate ? `Record ID: ${this.recordId}` : '',
				'='.repeat(50),
				'',
				...this.debugMessages
			].filter(line => line !== '').join('\n');

			await this.app.vault.create(filename, logContent);
			new Notice(`Debug log saved to ${filename}`);
			this.addDebugMessage(`Log saved to: ${filename}`);
		} catch (error) {
			new Notice('Failed to save debug log: ' + (error instanceof Error ? error.message : String(error)));
			this.addDebugMessage(`ERROR: Failed to save log: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async confirmSync() {
		this.addDebugMessage('--- Starting Sync Process ---');
		this.addDebugMessage(`Title: ${this.title}`);
		this.addDebugMessage(`State: ${this.state}`);
		this.addDebugMessage(`Visibility: ${this.visibility}`);
		this.addDebugMessage(`License: ${this.license}`);

		if (!this.title || this.title.trim().length === 0) {
			new Notice('Please enter a title for the record');
			this.addDebugMessage('ERROR: Title is required');
			return;
		}

		// Log sync confirmation
		this.addDebugMessage('User confirmed sync with parameters');
		this.addDebugMessage(JSON.stringify({
			title: this.title,
			state: this.state,
			visibility: this.visibility,
			license: this.license
		}, null, 2));

		try {
			await this.onConfirm({
				title: this.title,
				state: this.state,
				visibility: this.visibility,
				license: this.license
			});
			this.addDebugMessage('✅ Sync completed successfully');
			this.close();
		} catch (error) {
			// Log full error details
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.addDebugMessage(`❌ ERROR: ${errorMessage}`);
			
			// Log API response if available (for KadiError types)
			if (error && typeof error === 'object' && 'response' in error) {
				this.addDebugMessage('--- API Error Response ---');
				this.addDebugMessage(JSON.stringify(error.response, null, 2));
			}
			
			// Log status code if available
			if (error && typeof error === 'object' && 'statusCode' in error) {
				this.addDebugMessage(`Status Code: ${error.statusCode}`);
			}
			
			new Notice('Sync failed: ' + errorMessage);
		}
	}

	private addStyles() {
		// Add inline styles for the modal
		const style = document.createElement('style');
		style.textContent = `
			/* Modal container width */
			.kadi-sync-modal-container {
				width: 650px;
				max-width: 90vw;
			}

			.kadi-sync-modal {
				/* Remove min-width since parent container handles sizing */
			}

			.kadi-file-info,
			.kadi-record-info {
				color: var(--text-muted);
				font-size: 0.9em;
				margin: 0.5em 0;
			}

			.kadi-settings-container {
				margin: 1.5em 0;
				padding: 1em;
				background: var(--background-secondary);
				border-radius: 6px;
			}

			.kadi-debug-section {
				margin-top: 1em;
				padding: 1em;
				background: var(--background-secondary);
				border-radius: 6px;
			}

			.kadi-debug-messages {
				background: var(--background-primary);
				color: var(--text-normal);
				padding: 1em;
				border-radius: 4px;
				max-height: 300px;
				overflow-y: auto;
				font-family: var(--font-monospace);
				font-size: 0.85em;
				line-height: 1.4;
				white-space: pre-wrap;
				word-wrap: break-word;
				margin-bottom: 1em;
			}

			.kadi-button-container {
				display: flex;
				justify-content: flex-end;
				gap: 0.5em;
				margin-top: 1.5em;
				padding-top: 1em;
				border-top: 1px solid var(--background-modifier-border);
			}

			.kadi-button-container button {
				padding: 0.5em 1.5em;
			}

			/* License selection modal styles */
			.kadi-license-suggestion {
				padding: 0.5em;
			}

			.kadi-license-container {
				display: flex;
				flex-direction: column;
				gap: 0.25em;
			}

			.kadi-license-name {
				font-size: 1em;
				font-weight: 500;
				color: var(--text-normal);
			}

			.kadi-license-id {
				font-size: 0.85em;
				color: var(--text-muted);
				font-family: var(--font-monospace);
			}
		`;
		document.head.appendChild(style);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Public method to add debug messages from external code (e.g., during API calls)
	 */
	public logDebug(message: string) {
		this.addDebugMessage(message);
	}
}
