# CORS Fix for Obsidian Plugin

## Problem

When trying to connect to the Kadi4Mat API from the Obsidian plugin, you may encounter this error:

```
Access to fetch at 'https://kadi4mat.example.org/api/users/me' 
from origin 'app://obsidian.md' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

**Obsidian runs in an Electron environment** with the origin `app://obsidian.md`. When using the standard browser `fetch()` API:

1. The browser (Electron/Chromium) performs a CORS preflight check
2. The Kadi4Mat server doesn't have `app://obsidian.md` in its CORS allow-list
3. The request is blocked before it even reaches the server

**This is NOT:**
- ❌ A problem with your PAT token
- ❌ Multiple clients using the same token (PATs can be used from multiple locations)
- ❌ A server configuration you can change (unless you control the Kadi4Mat server)

## Solution

Obsidian provides a special `requestUrl()` API that **bypasses CORS restrictions** in the Electron environment. This is the recommended way to make HTTP requests from Obsidian plugins.

### Implementation

We created a **fetch polyfill** that uses Obsidian's `requestUrl()` under the hood:

**File:** `src/utils/obsidianFetch.ts`

```typescript
import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';

export async function obsidianFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const url = input.toString();
    const method = init?.method || 'GET';
    const headers: Record<string, string> = {};
    
    // Convert Headers to plain object
    if (init?.headers) {
        // ... header conversion logic
    }

    const requestParams: RequestUrlParam = {
        url,
        method,
        headers,
        body: init?.body as string | ArrayBuffer | undefined,
        throw: false,
    };

    const response: RequestUrlResponse = await requestUrl(requestParams);
    
    // Convert to standard Response object
    return new Response(
        response.arrayBuffer,
        {
            status: response.status,
            statusText: '',
            headers: new Headers(response.headers),
        }
    );
}

export function installObsidianFetch(): void {
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = obsidianFetch;
    (globalThis as any).__originalFetch = originalFetch;
}

export function uninstallObsidianFetch(): void {
    if ((globalThis as any).__originalFetch) {
        globalThis.fetch = (globalThis as any).__originalFetch;
        delete (globalThis as any).__originalFetch;
    }
}
```

### Plugin Integration

**File:** `src/main.ts`

```typescript
import { installObsidianFetch, uninstallObsidianFetch } from './utils/obsidianFetch';

export default class KadiMatSyncPlugin extends Plugin {
    async onload() {
        // Install fetch polyfill BEFORE initializing the client
        installObsidianFetch();
        
        await this.loadSettings();
        this.initializeClient();
        // ... rest of initialization
    }

    onunload() {
        // Clean up
        uninstallObsidianFetch();
    }
}
```

## How It Works

1. **Plugin loads** → `installObsidianFetch()` replaces global `fetch` with our polyfill
2. **kadi4mat-client makes requests** → Uses `fetch()` (now our polyfill)
3. **Our polyfill** → Calls Obsidian's `requestUrl()` instead
4. **Obsidian's API** → Makes request without CORS checks (Electron privilege)
5. **Server responds** → No CORS headers needed
6. **Our polyfill** → Converts Obsidian response to standard Response object
7. **kadi4mat-client** → Works as normal, unaware of the polyfill

## Benefits

✅ **Works with any Kadi4Mat server** (no server configuration needed)
✅ **No changes to kadi4mat-client** (stays browser/Node.js compatible)
✅ **Standard fetch API** (kadi4mat-client code unchanged)
✅ **Clean integration** (installed once at plugin load)
✅ **Proper cleanup** (uninstalled on plugin unload)

## Testing

After implementing this fix:

1. **Reload Obsidian** or reload the plugin
2. **Open Settings** → Kadi4Mat Sync
3. **Click "Test Connection"**
4. **Should succeed** ✅

You should see:
```
✓ Connected successfully
User: YourUsername
```

Instead of:
```
❌ Connection test failed: CORS error
```

## Alternative Solutions (Not Used)

### Option 1: Modify kadi4mat-client

**Pros:** More direct
**Cons:** 
- Would break Node.js compatibility
- Would require different builds for different environments
- More maintenance burden

### Option 2: Server-side CORS Configuration

**Pros:** Standard web approach
**Cons:**
- Requires server access (most users don't have this)
- Kadi4Mat server would need to allow `app://obsidian.md` origin
- Not scalable (every Electron app would need to be added)

### Option 3: Use Obsidian's requestUrl Directly

**Pros:** Most direct Obsidian way
**Cons:**
- Would require rewriting all kadi4mat-client HTTP logic
- Would lose compatibility with browser/Node.js
- More code to maintain

**Our solution (fetch polyfill) is the best compromise.**

## Debugging

If you still see CORS errors after this fix:

1. **Check that polyfill is installed:**
   ```javascript
   // In developer console
   console.log(typeof globalThis.__originalFetch); // Should be 'function'
   ```

2. **Check if plugin loaded:**
   ```javascript
   // In developer console
   console.log('Kadi4Mat Sync plugin loaded');
   ```

3. **Check network tab:**
   - Open Obsidian Developer Tools (Ctrl+Shift+I / Cmd+Option+I)
   - Go to Network tab
   - Try connection test
   - Should see request go through without CORS error

4. **Check for other errors:**
   - SSL certificate issues (set `verifySSL: false` in settings if needed)
   - Invalid PAT token
   - Wrong host URL
   - Network connectivity

## Related Issues

- [Obsidian Forum: CORS issues in plugins](https://forum.obsidian.md)
- [Obsidian API: requestUrl documentation](https://docs.obsidian.md/Reference/TypeScript+API/requestUrl)
- [Electron CORS behavior](https://www.electronjs.org/docs/latest/api/protocol)

## Summary

The CORS error is a **normal Electron security feature**, not a bug. Our fetch polyfill bridges the gap between:
- Standard fetch API (used by kadi4mat-client)
- Obsidian's requestUrl API (bypasses CORS in Electron)

This allows the kadi4mat-client library to work seamlessly in Obsidian without any modifications.

---

**Implementation Date:** February 12, 2026  
**Status:** ✅ Resolved  
**Files Modified:** 
- `src/utils/obsidianFetch.ts` (new)
- `src/main.ts` (updated)
