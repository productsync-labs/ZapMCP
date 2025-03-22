import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

export const newCommand = (program: Command): void => {
  program
    .command('new')
    .description('Create a new ZapMCP project')
    .argument('<project-name>', 'Name of the project')
    .option('-t, --template <template>', 'Starter template to use', 'default')
    .action(async (projectName: string, options: { template: string }) => {
      console.log(chalk.blue(`Creating new ZapMCP project: ${projectName}`));
      console.log(chalk.gray(`Using template: ${options.template}`));
      
      const targetDir = path.resolve(process.cwd(), projectName);
      
      // Check if directory exists
      if (fs.existsSync(targetDir)) {
        console.error(chalk.red(`Error: Directory ${projectName} already exists`));
        process.exit(1);
      }
      
      try {
        // For now, just create a basic structure
        fs.mkdirSync(targetDir);
        fs.mkdirSync(path.join(targetDir, 'src'));
        
        // Create package.json
        const packageJson = {
          name: projectName,
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'zapmcp dev',
            build: 'zapmcp build',
            start: 'zapmcp start'
          },
          dependencies: {
            zapmcp: '^0.1.0'
          }
        };
        
        fs.writeJSONSync(
          path.join(targetDir, 'package.json'),
          packageJson,
          { spaces: 2 }
        );
        
        // Create a sample config file
        const configContent = {
          name: projectName,
          mpcConfig: {
            port: 3000
          }
        };
        
        fs.writeJSONSync(
          path.join(targetDir, 'zapmcp.config.json'),
          configContent,
          { spaces: 2 }
        );
        
        // Create a sample page
        const samplePageContent = `
// src/pages/index.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to ZapMCP!</h1>
      <p>This is a sample page created by the ZapMCP framework.</p>
    </div>
  );
}
`;
        
        fs.writeFileSync(
          path.join(targetDir, 'src', 'index.ts'),
          samplePageContent
        );
        
        console.log(chalk.green(`✅ Project created successfully at ${targetDir}`));
        console.log(chalk.blue(`To get started, run:`));
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan(`  npm install`));
        console.log(chalk.cyan(`  npm run dev`));
        
      } catch (error) {
        console.error(chalk.red('Error creating project:'), error);
        process.exit(1);
      }
    });
}; 