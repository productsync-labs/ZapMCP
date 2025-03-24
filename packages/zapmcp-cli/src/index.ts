#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { newCommand } from './commands/new.js';
import { buildCommand } from './commands/build.js';
import { docsCommand } from './commands/docs.js';

const program = new Command();

program
  .name('zapmcp')
  .description('ZapMCP - A wrapper around MCP server')
  .version('0.1.0');

// Add commands
newCommand(program);
buildCommand(program);
docsCommand(program);

program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(`See ${chalk.cyan('--help')} for a list of available commands.`);
  process.exit(1);
});

program.parse(process.argv);

// If no args, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 