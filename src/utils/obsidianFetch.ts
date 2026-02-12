/**
 * Obsidian HTTP adapter for kadi4mat-client
 * 
 * This adapter bridges the kadi4mat-client (which uses standard fetch)
 * with Obsidian's requestUrl API to avoid CORS issues.
 */

import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';

/**
 * Custom fetch implementation using Obsidian's requestUrl
 * This bypasses CORS restrictions in Obsidian's Electron environment
 */
export async function obsidianFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const url = input.toString();
    const method = init?.method || 'GET';
    const headers: Record<string, string> = {};
    
    // Convert Headers object to plain object
    if (init?.headers) {
        if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, init.headers);
        }
    }

    // Build Obsidian request parameters
    const requestParams: RequestUrlParam = {
        url,
        method,
        headers,
        body: init?.body as string | ArrayBuffer | undefined,
        throw: false, // We'll handle errors manually
    };

    try {
        const response: RequestUrlResponse = await requestUrl(requestParams);
        
        // Convert Obsidian response to standard Response object
        return new Response(
            response.arrayBuffer,
            {
                status: response.status,
                statusText: '', // Obsidian doesn't provide statusText
                headers: new Headers(response.headers),
            }
        );
    } catch (error) {
        // Handle network errors
        throw new TypeError(`Network error: ${error.message}`);
    }
}

/**
 * Polyfill fetch with Obsidian's requestUrl in the global scope
 * Call this once when the plugin loads
 */
export function installObsidianFetch(): void {
    // Store original fetch if needed
    const originalFetch = globalThis.fetch;
    
    // Replace global fetch with Obsidian implementation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = obsidianFetch;
    
    // Store reference to original for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__originalFetch = originalFetch;
}

/**
 * Restore original fetch (for cleanup)
 */
export function uninstallObsidianFetch(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((globalThis as any).__originalFetch) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globalThis.fetch = (globalThis as any).__originalFetch;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis as any).__originalFetch;
    }
}
