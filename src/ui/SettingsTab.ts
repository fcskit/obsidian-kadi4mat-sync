import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type KadiMatSyncPlugin from '../main';

export class KadiSettingTab extends PluginSettingTab {
	plugin: KadiMatSyncPlugin;

	constructor(app: App, plugin: KadiMatSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'Kadi4Mat Sync Settings' });

		// Connection Settings
		containerEl.createEl('h3', { text: 'Connection' });

		new Setting(containerEl)
			.setName('Kadi4Mat Host')
			.setDesc('URL of your Kadi4Mat instance (e.g., https://kadi.iam.kit.edu)')
			.addText(text => text
				.setPlaceholder('https://kadi.iam.kit.edu')
				.setValue(this.plugin.settings.host)
				.onChange(async (value) => {
					this.plugin.settings.host = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Personal Access Token (PAT)')
			.setDesc('Your Kadi4Mat PAT (get it from User Settings → Personal Access Tokens)')
			.addText(text => {
				text.setPlaceholder('Enter your PAT')
					.setValue(this.plugin.settings.pat)
					.onChange(async (value) => {
						this.plugin.settings.pat = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.type = 'password';
			});

		new Setting(containerEl)
			.setName('Test Connection')
			.setDesc('Verify your connection to Kadi4Mat')
			.addButton(button => button
				.setButtonText('Test')
				.onClick(async () => {
					if (!this.plugin.client) {
						new Notice('Please enter host and PAT first');
						return;
					}

					button.setButtonText('Testing...');
					button.setDisabled(true);

					try {
						const user = await this.plugin.client.getCurrentUser();
						new Notice(`✅ Connected successfully as ${user.identity.username}`);
					} catch (error) {
						new Notice(`❌ Connection failed: ${error.message}`);
						console.error('Connection test failed:', error);
					} finally {
						button.setButtonText('Test');
						button.setDisabled(false);
					}
				}));

		new Setting(containerEl)
			.setName('Timeout')
			.setDesc('Request timeout in milliseconds (default: 60000)')
			.addText(text => text
				.setPlaceholder('60000')
				.setValue(String(this.plugin.settings.timeout))
				.onChange(async (value) => {
					const timeout = parseInt(value);
					if (!isNaN(timeout) && timeout > 0) {
						this.plugin.settings.timeout = timeout;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('Verify SSL Certificate')
			.setDesc('Verify SSL certificate when connecting (recommended)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.verifySSL)
				.onChange(async (value) => {
					this.plugin.settings.verifySSL = value;
					await this.plugin.saveSettings();
				}));

		// Sync Options
		containerEl.createEl('h3', { text: 'Sync Options' });

		new Setting(containerEl)
			.setName('Auto-sync on save')
			.setDesc('Automatically sync notes when saved')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSyncOnSave)
				.onChange(async (value) => {
					this.plugin.settings.autoSyncOnSave = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Sync attachments')
			.setDesc('Include embedded images and files when syncing')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.syncAttachments)
				.onChange(async (value) => {
					this.plugin.settings.syncAttachments = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default visibility')
			.setDesc('Default visibility for new records')
			.addDropdown(dropdown => dropdown
				.addOption('private', 'Private')
				.addOption('public', 'Public')
				.setValue(this.plugin.settings.defaultVisibility)
				.onChange(async (value: 'private' | 'public') => {
					this.plugin.settings.defaultVisibility = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default state')
			.setDesc('Default state for new records')
			.addDropdown(dropdown => dropdown
				.addOption('active', 'Active')
				.addOption('inactive', 'Inactive')
				.setValue(this.plugin.settings.defaultState)
				.onChange(async (value: 'active' | 'inactive') => {
					this.plugin.settings.defaultState = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Conflict resolution')
			.setDesc('How to handle conflicts when both local and remote have changed')
			.addDropdown(dropdown => dropdown
				.addOption('local', 'Keep local (overwrite remote)')
				.addOption('remote', 'Keep remote (discard local)')
				.addOption('ask', 'Ask each time')
				.setValue(this.plugin.settings.conflictResolution)
				.onChange(async (value: 'local' | 'remote' | 'ask') => {
					this.plugin.settings.conflictResolution = value;
					await this.plugin.saveSettings();
				}));

		// Advanced Options
		containerEl.createEl('h3', { text: 'Advanced Options' });

		new Setting(containerEl)
			.setName('Tag filter')
			.setDesc('Only sync notes with these tags (comma-separated, leave empty for all)')
			.addText(text => text
				.setPlaceholder('experiment, project')
				.setValue(this.plugin.settings.tagFilter.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.tagFilter = value
						.split(',')
						.map(t => t.trim())
						.filter(t => t.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Exclude folders')
			.setDesc('Never sync notes in these folders (comma-separated)')
			.addText(text => text
				.setPlaceholder('Archive, Templates')
				.setValue(this.plugin.settings.excludeFolders.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.excludeFolders = value
						.split(',')
						.map(f => f.trim())
						.filter(f => f.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc('Enable detailed logging for troubleshooting')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debugMode)
				.onChange(async (value) => {
					this.plugin.settings.debugMode = value;
					await this.plugin.saveSettings();
				}));

		// Info section
		containerEl.createEl('h3', { text: 'About' });
		containerEl.createDiv({ text: 'Kadi4Mat Sync Plugin v0.1.0' });
		containerEl.createDiv().innerHTML = 
			'<a href="https://github.com/yourusername/obsidian-kadi4mat-sync">Documentation</a> | ' +
			'<a href="https://github.com/yourusername/obsidian-kadi4mat-sync/issues">Report Issues</a>';
	}
}
