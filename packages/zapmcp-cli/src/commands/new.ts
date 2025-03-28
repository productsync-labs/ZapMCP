import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const newCommand = (program: Command): void => {
  program
    .command('new')
    .description('Create a new ZapMCP project')
    .argument('<project-name>', 'Name of the project')
    .action(async (projectName: string) => {
      console.log(chalk.blue(`Creating new ZapMCP project: ${projectName}`));
      
      const targetDir = path.resolve(process.cwd(), projectName);
      
      // Check if directory exists
      if (fs.existsSync(targetDir)) {
        console.error(chalk.red(`Error: Directory ${projectName} already exists`));
        process.exit(1);
      }
      
      try {
        // Determine template directory - always use default
        const templateDir = path.resolve(__dirname, '../src/templates/default');
        
        // Check if template directory exists
        if (!fs.existsSync(templateDir)) {
          console.error(chalk.red(`Error: Template directory not found at ${templateDir}`));
          process.exit(1);
        }
        
        // Create project directory
        fs.mkdirSync(targetDir);
        
        // Copy template to target directory
        await copyTemplateFiles(templateDir, targetDir, {
          projectName,
          // Add more variables as needed for template replacement
        });
        
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

/**
 * Copy template files to the target directory
 */
async function copyTemplateFiles(
  templateDir: string, 
  targetDir: string, 
  variables: Record<string, string>
): Promise<void> {
  // Copy all files from template to target
  await fs.copy(templateDir, targetDir);
  
  // Process certain files to replace variables
  await processTemplateFiles(targetDir, variables);
}

/**
 * Process template files to replace variables
 */
async function processTemplateFiles(
  targetDir: string, 
  variables: Record<string, string>
): Promise<void> {
  // Process package.json
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJSON(packageJsonPath);
    
    // Replace name with project name
    packageJson.name = variables.projectName;
    
    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  // Process any other files that need variable replacement
  // For example: README.md, config files, etc.
  const configPath = path.join(targetDir, '.cursor', 'mcp.json');
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    content = content.replace(/project-name/g, variables.projectName);
    fs.writeFileSync(configPath, content);
  }
  
  // Replace project name in README.md
  const readmePath = path.join(targetDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    content = content.replace(/Project Name/g, variables.projectName);
    fs.writeFileSync(readmePath, content);
  }
  
  // Replace project name in index.ts
  const indexPath = path.join(targetDir, 'src', 'index.ts');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = content.replace(/project-name/g, variables.projectName);
    fs.writeFileSync(indexPath, content);
  }
}
