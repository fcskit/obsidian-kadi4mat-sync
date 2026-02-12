import { TFile } from 'obsidian';
import type KadiMatSyncPlugin from '../main';
import { parseKadiFrontmatter } from '../utils/metadata';

export class StatusBarManager {
	private statusBarEl: HTMLElement;
	private plugin: KadiMatSyncPlugin;

	constructor(statusBarEl: HTMLElement, plugin: KadiMatSyncPlugin) {
		this.statusBarEl = statusBarEl;
		this.plugin = plugin;
		this.update();
	}

	update() {
		const file = this.plugin.app.workspace.getActiveFile();
		
		if (!file || !this.plugin.client) {
			this.statusBarEl.setText('');
			return;
		}

		this.updateForFile(file);
	}

	private async updateForFile(file: TFile) {
		try {
			const metadata = this.plugin.app.metadataCache.getFileCache(file);
			if (!metadata || !metadata.frontmatter) {
				this.statusBarEl.setText('Kadi4Mat: Not synced');
				return;
			}

			const kadiMeta = parseKadiFrontmatter(metadata.frontmatter);
			
			if (kadiMeta.kadi_id) {
				const icon = this.getSyncStatusIcon(kadiMeta);
				const text = `Kadi4Mat: ${icon} ID ${kadiMeta.kadi_id}`;
				this.statusBarEl.setText(text);
				this.statusBarEl.title = `Last synced: ${kadiMeta.kadi_synced || 'Unknown'}`;
			} else {
				this.statusBarEl.setText('Kadi4Mat: Not synced');
			}
		} catch (error) {
			console.error('Error updating status bar:', error);
			this.statusBarEl.setText('Kadi4Mat: Error');
		}
	}

	private getSyncStatusIcon(kadiMeta: any): string {
		// Check if file was modified after last sync
		// For now, just return synced icon
		return '✓';
	}

	showSyncing() {
		this.statusBarEl.setText('Kadi4Mat: ⟳ Syncing...');
	}

	showError(message: string) {
		this.statusBarEl.setText(`Kadi4Mat: ✗ ${message}`);
	}

	showSuccess(recordId: number) {
		this.statusBarEl.setText(`Kadi4Mat: ✓ ID ${recordId}`);
		setTimeout(() => this.update(), 3000);
	}
}
