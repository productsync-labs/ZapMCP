import { Command } from 'commander';
import chalk from 'chalk';
import { exec } from 'child_process';
import path from 'path';

export const docsCommand = (program: Command): void => {
  program
    .command('docs')
    .description('Open ZapMCP documentation')
    .option('-l, --local', 'Serve documentation locally')
    .action((options: { local: boolean }) => {
      if (options.local) {
        console.log(chalk.blue('Serving ZapMCP documentation locally...'));
        // In a real implementation, this would start a local documentation server
        console.log(chalk.yellow('Local documentation server not implemented yet.'));
        console.log(chalk.gray('For now, visit the online documentation:'));
        console.log(chalk.cyan('https://zapmcp.docs.example.com'));
      } else {
        console.log(chalk.blue('Opening ZapMCP documentation...'));
        
        // URL to the documentation
        const docsUrl = 'https://zapmcp.docs.example.com';
        
        // Attempt to open the URL in the default browser
        let command;
        
        switch (process.platform) {
          case 'darwin': // macOS
            command = `open ${docsUrl}`;
            break;
          case 'win32': // Windows
            command = `start ${docsUrl}`;
            break;
          default: // Linux and others
            command = `xdg-open ${docsUrl}`;
            break;
        }
        
        exec(command, (error) => {
          if (error) {
            console.error(chalk.red('Failed to open browser:'), error);
            console.log(chalk.gray('You can manually access the documentation at:'));
            console.log(chalk.cyan(docsUrl));
          }
        });
        
        console.log(chalk.gray(`Documentation URL: ${docsUrl}`));
      }
    });
}; 