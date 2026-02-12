export interface KadiSettings {
	// Connection settings
	host: string;
	pat: string;
	timeout: number;
	verifySSL: boolean;

	// Sync options
	autoSyncOnSave: boolean;
	syncAttachments: boolean;
	defaultVisibility: 'private' | 'public';
	defaultState: 'active' | 'inactive';
	conflictResolution: 'local' | 'remote' | 'ask';

	// Advanced options
	customMetadataMapping: Record<string, string>;
	tagFilter: string[];
	excludeFolders: string[];
	debugMode: boolean;
}

export const DEFAULT_SETTINGS: KadiSettings = {
	// Connection settings
	host: 'https://kadi.iam.kit.edu',
	pat: '',
	timeout: 60000,
	verifySSL: true,

	// Sync options
	autoSyncOnSave: false,
	syncAttachments: true,
	defaultVisibility: 'private',
	defaultState: 'active',
	conflictResolution: 'ask',

	// Advanced options
	customMetadataMapping: {},
	tagFilter: [],
	excludeFolders: [],
	debugMode: false
};

export interface KadiFrontmatter {
	kadi_id?: number;
	kadi_identifier?: string;
	kadi_synced?: string;
	kadi_state?: string;
	kadi_visibility?: string;
	kadi_modified?: string;
}
