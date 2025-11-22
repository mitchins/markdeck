#!/usr/bin/env node
/**
 * Post-build script to add .js extensions to imports
 * This is needed because TypeScript doesn't add extensions automatically
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, 'dist');

async function addJsExtensions(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await addJsExtensions(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      let content = await readFile(fullPath, 'utf-8');
      
      // Add .js to relative imports that don't have an extension
      content = content.replace(
        /from\s+['"](\.[^'"]+?)(?<!\.js)['"]/g,
        (match, p1) => {
          // Skip if it already has .js or is importing from node_modules
          if (p1.endsWith('.js') || !p1.startsWith('.')) {
            return match;
          }
          return `from '${p1}.js'`;
        }
      );
      
      await writeFile(fullPath, content, 'utf-8');
    }
  }
}

console.log('Adding .js extensions to imports...');
await addJsExtensions(distDir);
console.log('Done!');
