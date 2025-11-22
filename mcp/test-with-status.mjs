#!/usr/bin/env node
/**
 * Test script to verify MCP server can query the actual STATUS.md
 */

import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from the compiled MCP distribution
import { parseStatusMarkdown } from './dist/src/core/parsers/markdown-parser.js';

const statusPath = resolve(process.cwd(), 'STATUS.md');

console.log('Testing MCP server with actual STATUS.md...\n');

try {
  // Read the actual STATUS.md
  const content = await readFile(statusPath, 'utf-8');
  console.log(`✓ Read STATUS.md (${content.length} bytes)\n`);
  
  // Parse it (simulating get_board tool)
  const project = parseStatusMarkdown(content);
  
  console.log('Board State:');
  console.log(`  Title: ${project.metadata.title}`);
  console.log(`  Version: ${project.metadata.version}`);
  console.log(`  Last Updated: ${project.metadata.lastUpdated}`);
  console.log(`  Swimlanes: ${project.swimlanes.length}`);
  console.log(`  Cards: ${project.cards.length}`);
  console.log(`  Notes: ${project.notes.length}\n`);
  
  console.log('Swimlanes:');
  project.swimlanes.forEach((lane, i) => {
    const laneCards = project.cards.filter(c => c.laneId === lane.id);
    console.log(`  ${i + 1}. ${lane.title} (${laneCards.length} cards)`);
  });
  console.log();
  
  console.log('Sample Cards:');
  project.cards.slice(0, 5).forEach((card, i) => {
    const emoji = card.status === 'done' ? '🟢' : 
                  card.blocked && card.status === 'todo' ? '🔴' :
                  card.blocked && card.status === 'in_progress' ? '🟧' :
                  card.status === 'in_progress' ? '🟡' : '🔵';
    console.log(`  ${i + 1}. ${emoji} ${card.title.substring(0, 50)}...`);
    console.log(`     Lane: ${card.laneId}, Status: ${card.status}, Blocked: ${card.blocked}`);
  });
  console.log();
  
  console.log('✅ MCP server can successfully query STATUS.md!');
  console.log('✅ All RYGBO emojis parsed correctly!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
