#!/usr/bin/env node
import { copyFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const prod = process.argv[2] === "production";
const DEV_VAULT = "../obsidian-dev-vault";
const PROD_VAULT = "./test-vault";
const PLUGIN_NAME = "obsidian-kadi4mat-sync";

const targetVault = process.env.DEV_VAULT || (prod ? PROD_VAULT : DEV_VAULT);
const pluginDir = `${targetVault}/.obsidian/plugins/${PLUGIN_NAME}`;

async function main() {
    console.log(`\n📦 Copying assets to ${pluginDir}...`);
    
    // Ensure directory exists
    await mkdir(pluginDir, { recursive: true });

    // Copy manifest.json
    await copyFile("./manifest.json", join(pluginDir, "manifest.json"));
    console.log("✓ Copied manifest.json");
    
    // Copy styles.css if it exists
    if (existsSync("./styles.css")) {
        await copyFile("./styles.css", join(pluginDir, "styles.css"));
        console.log("✓ Copied styles.css");
    }
    
    // Copy data.json if it exists (for plugin settings)
    if (existsSync("./data.json")) {
        await copyFile("./data.json", join(pluginDir, "data.json"));
        console.log("✓ Copied data.json");
    }
    
    console.log("✅ Asset copy complete\n");
}

main().catch(e => {
    console.error("❌ Error copying assets:", e);
    process.exit(1);
});
