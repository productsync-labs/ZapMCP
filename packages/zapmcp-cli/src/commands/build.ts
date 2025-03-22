import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

export const buildCommand = (program: Command): void => {
  program
    .command('build')
    .description('Build your ZapMCP project for production')
    .option('-o, --output <directory>', 'Output directory', 'dist')
    .action(async (options: { output: string }) => {
      console.log(chalk.blue('Building ZapMCP project...'));
      
      const cwd = process.cwd();
      const configPath = path.join(cwd, 'zapmcp.config.json');
      
      // Check if config file exists
      if (!fs.existsSync(configPath)) {
        console.error(chalk.red('Error: zapmcp.config.json not found. Are you in a ZapMCP project?'));
        process.exit(1);
      }
      
      try {
        // Read config
        const config = fs.readJSONSync(configPath);
        console.log(chalk.gray(`Building project: ${config.name}`));
        
        // Ensure output directory exists
        const outputDir = path.resolve(cwd, options.output);
        fs.ensureDirSync(outputDir);
        
        console.log(chalk.gray(`Output directory: ${outputDir}`));
        
        // Here you would implement the actual build process
        // For now, we'll just create a placeholder
        console.log(chalk.yellow('Building...'));
        
        // Create a sample output file
        const outputContent = `
// This is a placeholder output file
// In a real implementation, this would be the compiled MPC server
console.log('ZapMCP server starting...');
`;
        
        fs.writeFileSync(
          path.join(outputDir, 'server.js'),
          outputContent
        );
        
        console.log(chalk.green('✅ Build completed successfully!'));
        console.log(chalk.blue('To start your production server:'));
        console.log(chalk.cyan(`  node ${path.join(options.output, 'server.js')}`));
        
      } catch (error) {
        console.error(chalk.red('Error during build:'), error);
        process.exit(1);
      }
    });
}; 