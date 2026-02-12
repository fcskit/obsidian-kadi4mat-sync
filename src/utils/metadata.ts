import { App, TFile } from 'obsidian';
import { KadiFrontmatter } from '../settings';

export function parseKadiFrontmatter(frontmatter: any): KadiFrontmatter {
	return {
		kadi_id: frontmatter.kadi_id,
		kadi_identifier: frontmatter.kadi_identifier,
		kadi_synced: frontmatter.kadi_synced,
		kadi_state: frontmatter.kadi_state,
		kadi_visibility: frontmatter.kadi_visibility,
		kadi_modified: frontmatter.kadi_modified
	};
}

export async function updateKadiFrontmatter(
	app: App,
	file: TFile,
	updates: Partial<KadiFrontmatter>
): Promise<void> {
	await app.fileManager.processFrontMatter(file, (frontmatter) => {
		Object.assign(frontmatter, updates);
	});
}

export function hasKadiMetadata(frontmatter: any): boolean {
	return frontmatter && ('kadi_id' in frontmatter);
}

export function getKadiRecordId(frontmatter: any): number | null {
	if (!frontmatter || !frontmatter.kadi_id) {
		return null;
	}
	return typeof frontmatter.kadi_id === 'number' ? frontmatter.kadi_id : parseInt(frontmatter.kadi_id);
}
