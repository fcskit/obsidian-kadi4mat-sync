import { TFile } from 'obsidian';

/**
 * Type for Obsidian frontmatter
 */
export type FrontMatterCache = Record<string, unknown>;

/**
 * Fields that should be excluded from metadata conversion
 * These are Obsidian-specific or Kadi4Mat control fields
 */
const EXCLUDED_FIELDS = new Set([
	// Obsidian-specific fields
	'cssclasses',
	'cssclass',
	'aliases',
	'alias',
	'position',
	'tags', // Handled separately
	
	// Kadi4Mat control fields (prefixed with kadi_)
	'kadi_id',
	'kadi_identifier',
	'kadi_title',
	'kadi_state',
	'kadi_visibility',
	'kadi_synced',
	'kadi_modified',
	'kadi_tags',
]);

/**
 * Extract Kadi4Mat-specific fields from frontmatter
 * These are the core fields that map to top-level record properties
 */
export interface KadiFields {
	title?: string;
	identifier?: string;
	state?: string;
	visibility?: string;
	tags?: string[];
	recordId?: number;
}

/**
 * Extract Kadi4Mat fields from frontmatter
 * Falls back to file name for title if not specified
 */
export function extractKadiFields(file: TFile, frontmatter?: FrontMatterCache): KadiFields {
	if (!frontmatter) {
		return {
			title: file.basename
		};
	}

	const fields: KadiFields = {};

	// Title: Use kadi_title if present, otherwise file basename
	fields.title = typeof frontmatter.kadi_title === 'string' ? frontmatter.kadi_title : file.basename;

	// Identifier: Only use if explicitly set
	if (typeof frontmatter.kadi_identifier === 'string') {
		fields.identifier = frontmatter.kadi_identifier;
	}

	// State: Use kadi_state if present
	if (typeof frontmatter.kadi_state === 'string') {
		fields.state = frontmatter.kadi_state;
	}

	// Visibility: Use kadi_visibility if present
	if (typeof frontmatter.kadi_visibility === 'string') {
		fields.visibility = frontmatter.kadi_visibility;
	}

	// Tags: Combine kadi_tags and Obsidian tags
	const kadiTags = Array.isArray(frontmatter.kadi_tags) 
		? frontmatter.kadi_tags.map(tag => String(tag))
		: typeof frontmatter.kadi_tags === 'string'
			? [frontmatter.kadi_tags] 
			: [];
	
	const obsidianTags = extractTags(frontmatter);
	
	if (kadiTags.length > 0 || obsidianTags.length > 0) {
		// Deduplicate tags
		fields.tags = Array.from(new Set([...kadiTags, ...obsidianTags]));
	}

	// Record ID: For updates
	if (typeof frontmatter.kadi_id === 'number') {
		fields.recordId = frontmatter.kadi_id;
	}

	return fields;
}

/**
 * Extract tags from Obsidian frontmatter
 * Handles both array format and string format
 */
export function extractTags(frontmatter: FrontMatterCache): string[] {
	if (!frontmatter || !frontmatter.tags) {
		return [];
	}

	const tags = frontmatter.tags;
	
	// Handle array format
	if (Array.isArray(tags)) {
		return tags.map(tag => {
			// Remove leading # if present
			return typeof tag === 'string' ? tag.replace(/^#/, '') : String(tag);
		});
	}
	
	// Handle string format
	if (typeof tags === 'string') {
		return tags.split(/[,\s]+/)
			.map(tag => tag.trim().replace(/^#/, ''))
			.filter(tag => tag.length > 0);
	}

	return [];
}

/**
 * Filter frontmatter to extract only custom metadata
 * Removes Kadi4Mat control fields and Obsidian-specific fields
 */
export function filterMetadata(frontmatter: FrontMatterCache): Record<string, unknown> {
	if (!frontmatter) {
		return {};
	}

	const filtered: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(frontmatter)) {
		// Skip excluded fields
		if (EXCLUDED_FIELDS.has(key)) {
			continue;
		}

		// Skip any field starting with kadi_
		if (key.startsWith('kadi_')) {
			continue;
		}

		// Include everything else
		filtered[key] = value;
	}

	return filtered;
}

/**
 * Check if a note has been synced to Kadi4Mat
 */
export function isSynced(frontmatter: FrontMatterCache | undefined): boolean {
	return !!frontmatter && typeof frontmatter.kadi_id === 'number';
}

/**
 * Get the Kadi4Mat record ID from frontmatter
 */
export function getRecordId(frontmatter: FrontMatterCache | undefined): number | undefined {
	if (frontmatter && typeof frontmatter.kadi_id === 'number') {
		return frontmatter.kadi_id;
	}
	return undefined;
}

/**
 * Create Kadi4Mat frontmatter fields to add to a note
 */
export function createKadiFrontmatter(record: {
	id: number;
	identifier: string;
	state?: string;
	visibility?: string;
}): Record<string, string | number> {
	return {
		kadi_id: record.id,
		kadi_identifier: record.identifier,
		kadi_synced: new Date().toISOString(),
		...(record.state && { kadi_state: record.state }),
		...(record.visibility && { kadi_visibility: record.visibility })
	};
}
