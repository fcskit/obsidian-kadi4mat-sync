import { TFile, Notice } from 'obsidian';
import type KadiMatSyncPlugin from '../main';
import { jsonToExtras, extrasToJson } from 'kadi4mat-client';
import { parseKadiFrontmatter, updateKadiFrontmatter } from '../utils/metadata';
import { extractNoteTitle, extractNoteContent } from '../utils/noteParser';
import { 
	extractKadiFields, 
	filterMetadata, 
	isSynced, 
	createKadiFrontmatter 
} from '../utils/frontmatter';
import { SyncModal } from '../ui/SyncModal';

export class SyncEngine {
	private plugin: KadiMatSyncPlugin;

	constructor(plugin: KadiMatSyncPlugin) {
		this.plugin = plugin;
	}

	async syncNote(file: TFile): Promise<void> {
		if (!this.plugin.client) {
			new Notice('Kadi4Mat not configured. Please check settings.');
			return;
		}

		// Check if file should be synced
		if (!this.shouldSyncFile(file)) {
			new Notice('This file is excluded from sync');
			return;
		}

		// Show modal dialog to configure sync
		const modal = new SyncModal(
			this.plugin.app,
			this.plugin,
			file,
			async (params) => {
				modal.logDebug('User confirmed sync with parameters');
				modal.logDebug(JSON.stringify(params, null, 2));
				
				try {
					this.plugin.statusBar.showSyncing();
					
					// Read note content
					const content = await this.plugin.app.vault.read(file);
					modal.logDebug(`Read note content: ${content.length} characters`);
					
					// Parse frontmatter
					const metadata = this.plugin.app.metadataCache.getFileCache(file);
					const kadiMeta = metadata?.frontmatter ? parseKadiFrontmatter(metadata.frontmatter) : {};

					// Extract note information
					const noteTitle = extractNoteTitle(content, file.basename);
					const description = extractNoteContent(content);
					modal.logDebug(`Extracted title: ${noteTitle}`);
					modal.logDebug(`Description length: ${description.length} characters`);

					if (kadiMeta.kadi_id) {
						// Update existing record
						modal.logDebug(`Updating existing record ${kadiMeta.kadi_id}`);
						await this.updateRecordWithModal(file, kadiMeta.kadi_id, params, description, content, modal);
					} else {
						// Create new record
						modal.logDebug('Creating new record');
						await this.createRecordWithModal(file, params, description, content, modal);
					}

				} catch (error) {
					const errorMsg = error instanceof Error ? error.message : String(error);
					modal.logDebug(`ERROR: ${errorMsg}`);
					console.error('Sync failed:', error);
					new Notice(`Sync failed: ${errorMsg}`);
					this.plugin.statusBar.showError('Sync failed');
					throw error; // Re-throw to be caught by modal
				}
			}
		);
		
		modal.open();
	}

	private async createRecord(file: TFile, title: string, description: string, content: string): Promise<void> {
		// Get frontmatter
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;
		
		// Extract Kadi4Mat fields
		const kadiFields = extractKadiFields(file, frontmatter);
		
		// Filter and convert custom metadata to extras
		const customMetadata = filterMetadata(frontmatter || {});
		
		// Add Obsidian-specific metadata
		const metadataWithContext = {
			...customMetadata,
			obsidian_filename: file.path,
			obsidian_vault: this.plugin.app.vault.getName(),
			created_date: new Date().toISOString(),
		};
		
		// Convert to Kadi4Mat extras format with nested structure support
		const extras = jsonToExtras(metadataWithContext, {
			nestObjects: true,  // Support nested structures (sample.name, etc.)
			parseUnits: true,   // Parse "25.5 °C" format
		});
		
		// Validate state if provided, otherwise use default
		const validStates = ['draft', 'submitted', 'published'] as const;
		const state = kadiFields.state && validStates.includes(kadiFields.state as typeof validStates[number])
			? kadiFields.state as typeof validStates[number]
			: this.plugin.settings.defaultState as typeof validStates[number];
		
		// Validate visibility if provided, otherwise use default
		const validVisibilities = ['private', 'internal', 'public'] as const;
		const visibility = kadiFields.visibility && validVisibilities.includes(kadiFields.visibility as typeof validVisibilities[number])
			? kadiFields.visibility as typeof validVisibilities[number]
			: this.plugin.settings.defaultVisibility as typeof validVisibilities[number];
		
		const record = await this.plugin.client!.createRecord({
			title: kadiFields.title || title,
			state,
			visibility,
			...(kadiFields.identifier && { identifier: kadiFields.identifier }),
			...(kadiFields.tags && kadiFields.tags.length > 0 && { tags: kadiFields.tags }),
			extras: extras
		});

		// Update frontmatter with Kadi4Mat fields
		await updateKadiFrontmatter(this.plugin.app, file, createKadiFrontmatter(record));

		new Notice(`✅ Created Kadi4Mat record: ${record.identifier}`);
		this.plugin.statusBar.showSuccess(record.id);

		this.log('Created record', { id: record.id, identifier: record.identifier, file: file.path });
	}

	private async createRecordWithModal(
		file: TFile, 
		params: {
			title: string;
			state: 'active' | 'inactive';
			visibility: 'private' | 'public';
			license: string;
		},
		description: string, 
		content: string,
		modal: { logDebug: (msg: string) => void }
	): Promise<void> {
		// Get frontmatter
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;
		
		modal.logDebug('Extracting Kadi4Mat fields from frontmatter');
		const kadiFields = extractKadiFields(file, frontmatter);
		
		modal.logDebug('Filtering custom metadata');
		const customMetadata = filterMetadata(frontmatter || {});
		modal.logDebug(`Found ${Object.keys(customMetadata).length} custom metadata fields`);
		
		// Add Obsidian-specific metadata
		const metadataWithContext = {
			...customMetadata,
			obsidian_filename: file.path,
			obsidian_vault: this.plugin.app.vault.getName(),
			created_date: new Date().toISOString(),
		};
		
		modal.logDebug('Converting metadata to Kadi4Mat extras format');
		const extras = jsonToExtras(metadataWithContext, {
			nestObjects: true,
			parseUnits: true,
		});
		modal.logDebug(`Generated ${extras.length} extras fields`);
		
		// Count nested structures
		const nestedCount = extras.filter(e => e.type === 'dict' || e.type === 'list').length;
		if (nestedCount > 0) {
			modal.logDebug(`Including ${nestedCount} nested structures (dict/list)`);
		}
		
		modal.logDebug('Preparing create record request');
		
		// Generate identifier if not present in frontmatter
		const identifier = kadiFields.identifier || this.generateIdentifier(params.title);
		modal.logDebug(`Using identifier: ${identifier}`);
		
		const createParams = {
			title: params.title,
			identifier: identifier,  // Always include identifier
			state: params.state,
			visibility: params.visibility,
			...(params.license && { license: params.license }),
			...(kadiFields.tags && kadiFields.tags.length > 0 && { tags: kadiFields.tags }),
			...(description && { description }),
			extras: extras
		};
		
		modal.logDebug(`Request params: ${JSON.stringify({
			...createParams,
			extras: `[${extras.length} items]`,
			description: description ? `[${description.length} chars]` : 'none'
		})}`);
		
		modal.logDebug('Sending create request to Kadi4Mat API...');
		
		try {
			const record = await this.plugin.client!.createRecord(createParams);
			modal.logDebug(`✅ Record created successfully with ID: ${record.id}`);
			modal.logDebug(`Identifier: ${record.identifier}`);

			// Update frontmatter
			modal.logDebug('Updating note frontmatter with Kadi4Mat identifiers');
			const frontmatterUpdate: Record<string, string | number> = {
				...createKadiFrontmatter(record)
			};
			if (params.license) {
				frontmatterUpdate.kadi_license = params.license;
			}
			await updateKadiFrontmatter(this.plugin.app, file, frontmatterUpdate as unknown as Partial<{ kadi_id: number; kadi_identifier: string; kadi_synced: string; kadi_state: string; kadi_visibility: string; }>);
			modal.logDebug('Frontmatter updated');

			new Notice(`✅ Created Kadi4Mat record: ${record.identifier}`);
			this.plugin.statusBar.showSuccess(record.id);

			this.log('Created record', { id: record.id, identifier: record.identifier, file: file.path });
		} catch (error) {
			// Enhanced error logging
			const errorMessage = error instanceof Error ? error.message : String(error);
			modal.logDebug(`ERROR: ${errorMessage}`);
			
			// Log API response details if available
			if (error && typeof error === 'object') {
				if ('statusCode' in error) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					modal.logDebug(`Status Code: ${(error as any).statusCode}`);
				}
				if ('response' in error) {
					modal.logDebug('API Response:');
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					modal.logDebug(JSON.stringify((error as any).response, null, 2));
				}
			}
			
			// Re-throw to be caught by modal
			throw error;
		}
	}

	private async updateRecord(file: TFile, recordId: number, title: string, description: string, content: string): Promise<void> {
		// Get frontmatter
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;
		
		// Extract Kadi4Mat fields
		const kadiFields = extractKadiFields(file, frontmatter);
		
		// Filter and convert custom metadata to extras
		const customMetadata = filterMetadata(frontmatter || {});
		
		// Add Obsidian-specific metadata
		const metadataWithContext = {
			...customMetadata,
			obsidian_filename: file.path,
			obsidian_vault: this.plugin.app.vault.getName(),
			modified_date: new Date().toISOString(),
		};
		
		// Convert to Kadi4Mat extras format with nested structure support
		const extras = jsonToExtras(metadataWithContext, {
			nestObjects: true,
			parseUnits: true,
		});
		
		// Validate state if provided
		const validStates = ['draft', 'submitted', 'published'] as const;
		const state = kadiFields.state && validStates.includes(kadiFields.state as typeof validStates[number])
			? kadiFields.state as typeof validStates[number]
			: undefined;
		
		// Validate visibility if provided
		const validVisibilities = ['private', 'internal', 'public'] as const;
		const visibility = kadiFields.visibility && validVisibilities.includes(kadiFields.visibility as typeof validVisibilities[number])
			? kadiFields.visibility as typeof validVisibilities[number]
			: undefined;
		
		const record = await this.plugin.client!.updateRecord(recordId, {
			title: kadiFields.title || title,
			...(state && { state }),
			...(visibility && { visibility }),
			...(kadiFields.identifier && { identifier: kadiFields.identifier }),
			...(kadiFields.tags && kadiFields.tags.length > 0 && { tags: kadiFields.tags }),
			extras: extras
		});

		// Update frontmatter
		await updateKadiFrontmatter(this.plugin.app, file, {
			kadi_synced: new Date().toISOString(),
			kadi_modified: new Date().toISOString()
		});

		new Notice(`✅ Updated Kadi4Mat record: ${record.identifier}`);
		this.plugin.statusBar.showSuccess(record.id);

		this.log('Updated record', { id: record.id, identifier: record.identifier, file: file.path });
	}

	private async updateRecordWithModal(
		file: TFile, 
		recordId: number,
		params: {
			title: string;
			state: 'draft' | 'submitted' | 'published';
			visibility: 'private' | 'internal' | 'public';
			license: string;
		},
		description: string, 
		content: string,
		modal: { logDebug: (msg: string) => void }
	): Promise<void> {
		// Get frontmatter
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		const frontmatter = metadata?.frontmatter;
		
		modal.logDebug('Extracting Kadi4Mat fields from frontmatter');
		const kadiFields = extractKadiFields(file, frontmatter);
		
		modal.logDebug('Filtering custom metadata');
		const customMetadata = filterMetadata(frontmatter || {});
		modal.logDebug(`Found ${Object.keys(customMetadata).length} custom metadata fields`);
		
		// Add Obsidian-specific metadata
		const metadataWithContext = {
			...customMetadata,
			obsidian_filename: file.path,
			obsidian_vault: this.plugin.app.vault.getName(),
			modified_date: new Date().toISOString(),
		};
		
		modal.logDebug('Converting metadata to Kadi4Mat extras format');
		const extras = jsonToExtras(metadataWithContext, {
			nestObjects: true,
			parseUnits: true,
		});
		modal.logDebug(`Generated ${extras.length} extras fields`);
		
		modal.logDebug('Preparing update record request');
		const updateParams = {
			title: params.title,
			state: params.state,
			visibility: params.visibility,
			...(params.license && { license: params.license }),
			...(kadiFields.identifier && { identifier: kadiFields.identifier }),
			...(kadiFields.tags && kadiFields.tags.length > 0 && { tags: kadiFields.tags }),
			...(description && { description }),
			extras: extras
		};
		
		modal.logDebug(`Request params: ${JSON.stringify({
			...updateParams,
			extras: `[${extras.length} items]`,
			description: description ? `[${description.length} chars]` : 'none'
		})}`);
		
		modal.logDebug(`Sending update request to Kadi4Mat API for record ${recordId}...`);
		const record = await this.plugin.client!.updateRecord(recordId, updateParams);
		modal.logDebug(`✅ Record updated successfully`);
		modal.logDebug(`Identifier: ${record.identifier}`);

		// Update frontmatter
		modal.logDebug('Updating note frontmatter timestamps');
		const frontmatterUpdate: Record<string, string> = {
			kadi_synced: new Date().toISOString(),
			kadi_modified: new Date().toISOString()
		};
		if (params.license) {
			frontmatterUpdate.kadi_license = params.license;
		}
		await updateKadiFrontmatter(this.plugin.app, file, frontmatterUpdate as unknown as Partial<{ kadi_id: number; kadi_identifier: string; kadi_synced: string; kadi_state: string; kadi_visibility: string; }>);
		modal.logDebug('Frontmatter updated');

		new Notice(`✅ Updated Kadi4Mat record: ${record.identifier}`);
		this.plugin.statusBar.showSuccess(record.id);

		this.log('Updated record', { id: record.id, identifier: record.identifier, file: file.path });
	}

	private shouldSyncFile(file: TFile): boolean {
		// Check file extension
		if (file.extension !== 'md') {
			return false;
		}

		// Check excluded folders
		for (const folder of this.plugin.settings.excludeFolders) {
			if (file.path.startsWith(folder)) {
				return false;
			}
		}

		// Check tag filter
		if (this.plugin.settings.tagFilter.length > 0) {
			const metadata = this.plugin.app.metadataCache.getFileCache(file);
			const tags = metadata?.tags?.map(t => t.tag.replace('#', '')) || [];
			
			const hasMatchingTag = this.plugin.settings.tagFilter.some((filterTag: string) =>
				tags.includes(filterTag)
			);

			if (!hasMatchingTag) {
				return false;
			}
		}

		return true;
	}

	private mapCustomMetadata(file: TFile): Record<string, unknown> {
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		if (!metadata || !metadata.frontmatter) {
			return {};
		}

		const mapped: Record<string, unknown> = {};
		for (const [obsidianKey, kadiKey] of Object.entries(this.plugin.settings.customMetadataMapping)) {
			if (obsidianKey in metadata.frontmatter) {
				mapped[String(kadiKey)] = metadata.frontmatter[obsidianKey];
			}
		}

		return mapped;
	}

	async showSyncStatus(file: TFile): Promise<void> {
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		if (!metadata || !metadata.frontmatter) {
			new Notice('This note has not been synced yet');
			return;
		}

		const kadiMeta = parseKadiFrontmatter(metadata.frontmatter);
		
		if (kadiMeta.kadi_id) {
			const message = `
Record ID: ${kadiMeta.kadi_id}
Identifier: ${kadiMeta.kadi_identifier || 'N/A'}
Last synced: ${kadiMeta.kadi_synced || 'Unknown'}
State: ${kadiMeta.kadi_state || 'N/A'}
Visibility: ${kadiMeta.kadi_visibility || 'N/A'}
			`.trim();
			new Notice(message, 5000);
		} else {
			new Notice('This note has not been synced yet');
		}
	}

	async openInKadi(file: TFile): Promise<void> {
		const metadata = this.plugin.app.metadataCache.getFileCache(file);
		if (!metadata || !metadata.frontmatter) {
			new Notice('This note has not been synced yet');
			return;
		}

		const kadiMeta = parseKadiFrontmatter(metadata.frontmatter);
		
		if (kadiMeta.kadi_id) {
			const url = `${this.plugin.settings.host}/records/${kadiMeta.kadi_id}`;
			window.open(url, '_blank');
		} else {
			new Notice('This note has not been synced yet');
		}
	}

	private log(message: string, data?: unknown) {
		if (this.plugin.settings.debugMode) {
			console.log(`[KadiSync] ${message}`, data);
		}
	}

	/**
	 * Generate a unique identifier for a new record
	 * Format: title-slug-timestamp
	 */
	private generateIdentifier(title: string): string {
		// Convert title to lowercase slug
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
			.replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
			.substring(0, 50);             // Limit length
		
		// Add timestamp for uniqueness
		const timestamp = new Date().toISOString()
			.replace(/[:.]/g, '-')         // Replace colons and periods
			.replace(/T/, '-')             // Replace T separator
			.replace(/Z$/, '')             // Remove Z suffix
			.toLowerCase();
		
		return `${slug}-${timestamp}`;
	}
}
