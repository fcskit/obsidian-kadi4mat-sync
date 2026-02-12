import { App, Plugin, PluginSettingTab, Setting, Notice, TFile } from 'obsidian';
import { KadiClient } from 'kadi4mat-client';
import { KadiSettings, DEFAULT_SETTINGS } from './settings';
import { KadiSettingTab } from './ui/SettingsTab';
import { StatusBarManager } from './ui/StatusBar';
import { SyncEngine } from './sync/SyncEngine';
import { installObsidianFetch, uninstallObsidianFetch } from './utils/obsidianFetch';

export default class KadiMatSyncPlugin extends Plugin {
	settings: KadiSettings;
	client: KadiClient | null = null;
	statusBar: StatusBarManager;
	syncEngine: SyncEngine;

	async onload() {
		console.log('Loading Kadi4Mat Sync plugin');
		
		// Install Obsidian fetch polyfill to avoid CORS issues
		installObsidianFetch();
		
		await this.loadSettings();

		// Initialize client if configured
		this.initializeClient();

		// Initialize sync engine
		this.syncEngine = new SyncEngine(this);

		// Add settings tab
		this.addSettingTab(new KadiSettingTab(this.app, this));

		// Initialize status bar
		this.statusBar = new StatusBarManager(this.addStatusBarItem(), this);

		// Register commands
		this.registerCommands();

		// Register event handlers
		this.registerEventHandlers();
	}

	onunload() {
		console.log('Unloading Kadi4Mat Sync plugin');
		
		// Restore original fetch
		uninstallObsidianFetch();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.initializeClient();
	}

	initializeClient() {
		if (this.settings.host && this.settings.pat) {
			try {
				this.client = new KadiClient({
					host: this.settings.host,
					pat: this.settings.pat,
					timeout: this.settings.timeout,
					verify: this.settings.verifySSL
				});
				console.log('Kadi4Mat client initialized');
			} catch (error) {
				console.error('Failed to initialize Kadi4Mat client:', error);
				this.client = null;
			}
		} else {
			this.client = null;
		}
	}

	registerCommands() {
		// Sync current note
		this.addCommand({
			id: 'sync-current-note',
			name: 'Sync current note to Kadi4Mat',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file && this.client) {
					if (!checking) {
						this.syncEngine.syncNote(file);
					}
					return true;
				}
				return false;
			}
		});

		// Download from Kadi4Mat
		this.addCommand({
			id: 'download-from-kadi',
			name: 'Download from Kadi4Mat',
			callback: () => {
				// TODO: Implement download modal
				new Notice('Download feature coming soon!');
			}
		});

		// Sync folder
		this.addCommand({
			id: 'sync-folder',
			name: 'Sync folder to Kadi4Mat',
			callback: () => {
				// TODO: Implement folder sync
				new Notice('Folder sync feature coming soon!');
			}
		});

		// View sync status
		this.addCommand({
			id: 'view-sync-status',
			name: 'View sync status',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file) {
					if (!checking) {
						this.syncEngine.showSyncStatus(file);
					}
					return true;
				}
				return false;
			}
		});

		// Open in Kadi4Mat
		this.addCommand({
			id: 'open-in-kadi',
			name: 'Open in Kadi4Mat',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file && this.client) {
					if (!checking) {
						this.syncEngine.openInKadi(file);
					}
					return true;
				}
				return false;
			}
		});

		// Test connection
		this.addCommand({
			id: 'test-connection',
			name: 'Test Kadi4Mat connection',
			callback: async () => {
				if (!this.client) {
					new Notice('Please configure Kadi4Mat settings first');
					return;
				}

				try {
					new Notice('Testing connection...');
					const user = await this.client.getCurrentUser();
					new Notice(`✅ Connected successfully as ${user.identity.username}`);
				} catch (error) {
					new Notice(`❌ Connection failed: ${error.message}`);
					console.error('Connection test failed:', error);
				}
			}
		});
	}

	registerEventHandlers() {
		// Auto-sync on save (if enabled)
		if (this.settings.autoSyncOnSave) {
			this.registerEvent(
				this.app.vault.on('modify', (file) => {
					if (file instanceof TFile && file.extension === 'md' && this.client) {
						// Debounce auto-sync
						// TODO: Implement debouncing
					}
				})
			);
		}

		// Update status bar when active file changes
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.statusBar.update();
			})
		);
	}

	async testConnection(): Promise<boolean> {
		if (!this.client) {
			return false;
		}

		try {
			await this.client.getCurrentUser();
			return true;
		} catch (error) {
			console.error('Connection test failed:', error);
			return false;
		}
	}
}
