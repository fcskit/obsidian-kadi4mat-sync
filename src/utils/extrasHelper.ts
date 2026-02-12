import { ExtraMetadata } from 'kadi4mat-client';

/**
 * @deprecated Use jsonToExtras from kadi4mat-client instead
 * Convert a flat object to ExtraMetadata array format
 */
export function objectToExtras(obj: Record<string, unknown>): ExtraMetadata[] {
	return Object.entries(obj).map(([key, value]) => ({
		key,
		value: value as string | number | boolean,
		type: inferType(value)
	}));
}

/**
 * @deprecated Use extrasToJson from kadi4mat-client instead
 * Convert ExtraMetadata array to flat object
 */
export function extrasToObject(extras?: ExtraMetadata[]): Record<string, unknown> {
	if (!extras) return {};
	
	const obj: Record<string, unknown> = {};
	for (const item of extras) {
		obj[item.key] = item.value;
	}
	return obj;
}

/**
 * Infer the type for ExtraMetadata using Kadi4Mat types
 */
function inferType(value: unknown): 'str' | 'int' | 'float' | 'bool' {
	if (typeof value === 'number') {
		return Number.isInteger(value) ? 'int' : 'float';
	}
	if (typeof value === 'boolean') return 'bool';
	return 'str';
}

/**
 * Merge two ExtraMetadata arrays, with second taking precedence
 */
export function mergeExtras(base?: ExtraMetadata[], updates?: ExtraMetadata[]): ExtraMetadata[] {
	const merged = [...(base || [])];
	const updateKeys = new Set((updates || []).map(e => e.key));
	
	// Remove items from base that will be updated
	const filtered = merged.filter(e => !updateKeys.has(e.key));
	
	// Add all updates
	return [...filtered, ...(updates || [])];
}
