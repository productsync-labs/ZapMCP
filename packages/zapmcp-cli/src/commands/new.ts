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
        // Determine template directory
        const templateDir = path.resolve(__dirname, '../../templates', options.template);
        
        // Check if template exists
        if (!fs.existsSync(templateDir)) {
          console.error(chalk.red(`Error: Template '${options.template}' not found`));
          console.log(chalk.gray(`Available templates: ${getAvailableTemplates().join(', ')}`));
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
 * Get list of available templates
 */
function getAvailableTemplates(): string[] {
  const templatesDir = path.resolve(__dirname, '../../templates');
  
  if (!fs.existsSync(templatesDir)) {
    return ['default'];
  }
  
  return fs.readdirSync(templatesDir).filter(file => 
    fs.statSync(path.join(templatesDir, file)).isDirectory()
  );
}

/**
 * Copy template files to the target directory
 */
async function copyTemplateFiles(
  templateDir: string, 
  targetDir: string, 
  variables: Record<string, string>
): Promise<void> {
  // If template doesn't exist, use the built-in default template
  if (!fs.existsSync(templateDir)) {
    createDefaultTemplate(targetDir, variables);
    return;
  }

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
    
    // Update scripts to use "zap" instead of "zapmcp"
    if (packageJson.scripts) {
      Object.keys(packageJson.scripts).forEach(scriptName => {
        packageJson.scripts[scriptName] = packageJson.scripts[scriptName].replace(/zapmcp/g, 'zap');
      });
    }
    
    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  // Process any other files that need variable replacement
  // For example: README.md, config files, etc.
  const configPath = path.join(targetDir, 'zapmcp.config.json');
  if (fs.existsSync(configPath)) {
    const config = await fs.readJSON(configPath);
    config.name = variables.projectName;
    await fs.writeJSON(configPath, config, { spaces: 2 });
  }
}

/**
 * Create default template if no template is provided
 */
function createDefaultTemplate(targetDir: string, variables: Record<string, string>): void {
  // Create basic folder structure
  fs.mkdirSync(path.join(targetDir, 'src'));
  
  // Create package.json
  const packageJson = {
    name: variables.projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'zap dev',
      build: 'zap build',
      start: 'zap start'
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
    name: variables.projectName,
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
// src/index.ts
import { FastMCP, Tool } from "zapmcp";

// Create a new FastMCP server
const server = new FastMCP({
  name: "${variables.projectName}",
  version: "0.1.0",
});

// Add a simple tool
server.addTool({
  name: "hello",
  description: "A simple hello world tool",
  execute: async () => {
    return "Hello from ${variables.projectName}!";
  }
});

// Start the server
server.start({
  transportType: "sse",
  sse: {
    endpoint: "/mcp",
    port: 3000,
  }
});

console.log("${variables.projectName} server is running on http://localhost:3000/mcp");
`;
  
  fs.writeFileSync(
    path.join(targetDir, 'src', 'index.ts'),
    samplePageContent
  );
  
  // Create a README.md
  const readmeContent = `# ${variables.projectName}

A ZapMCP project for interacting with AI models.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

This will start your ZapMCP server at http://localhost:3000/mcp
`;

  fs.writeFileSync(
    path.join(targetDir, 'README.md'),
    readmeContent
  );
} 