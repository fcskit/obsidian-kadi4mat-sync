/**
 * Extract the title from note content
 * Looks for first H1 heading, falls back to filename
 */
export function extractNoteTitle(content: string, fallbackTitle: string): string {
	// Remove frontmatter
	const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
	
	// Look for first H1 heading
	const h1Match = withoutFrontmatter.match(/^#\s+(.+)$/m);
	if (h1Match) {
		return h1Match[1].trim();
	}
	
	return fallbackTitle;
}

/**
 * Extract content from note (excluding frontmatter and title)
 */
export function extractNoteContent(content: string): string {
	// Remove frontmatter
	let processed = content.replace(/^---\n[\s\S]*?\n---\n/, '');
	
	// Remove first H1 if present (it's the title)
	processed = processed.replace(/^#\s+.+$\n?/m, '');
	
	return processed.trim();
}

/**
 * Extract tags from content
 */
export function extractTags(content: string): string[] {
	const tags: string[] = [];
	
	// Match hashtags (excluding in code blocks)
	const tagRegex = /#[\w-]+/g;
	let match;
	
	// Simple approach: just find all hashtags
	// TODO: Improve to exclude code blocks and inline code
	while ((match = tagRegex.exec(content)) !== null) {
		const tag = match[0].substring(1); // Remove #
		if (!tags.includes(tag)) {
			tags.push(tag);
		}
	}
	
	return tags;
}

/**
 * Find all embedded images in content
 */
export function extractEmbeddedImages(content: string): string[] {
	const images: string[] = [];
	
	// Match ![[image.png]] or ![](image.png)
	const wikiLinkRegex = /!\[\[([^\]]+)\]\]/g;
	const mdLinkRegex = /!\[.*?\]\(([^)]+)\)/g;
	
	let match;
	
	while ((match = wikiLinkRegex.exec(content)) !== null) {
		images.push(match[1]);
	}
	
	while ((match = mdLinkRegex.exec(content)) !== null) {
		images.push(match[1]);
	}
	
	return images;
}

/**
 * Convert Obsidian markdown to standard markdown
 * (for better compatibility with Kadi4Mat)
 */
export function convertObsidianMarkdown(content: string): string {
	let converted = content;
	
	// Convert wiki links [[Link]] to [Link](Link)
	converted = converted.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '[$2]($1)');
	converted = converted.replace(/\[\[([^\]]+)\]\]/g, '[$1]($1)');
	
	// Convert highlights ==text== to **text** (as Kadi4Mat might not support highlights)
	converted = converted.replace(/==([^=]+)==/g, '**$1**');
	
	return converted;
}
