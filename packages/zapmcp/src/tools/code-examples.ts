import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { Tool, Context } from '../types.js';

interface CodeExamplesToolConfig {
  name: string;
  description: string;
  examplesDir: string;
}

// Helper function to list code examples
async function listCodeExamples(examplesDir: string): Promise<Array<{ name: string; path: string }>> {
  try {
    const files = await fs.readdir(examplesDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f.replace('.md', ''),
        path: f,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

// Helper function to read a code example
async function readCodeExample(examplesDir: string, filename: string): Promise<string> {
  const filePath = path.join(examplesDir, filename);

  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    const examples = await listCodeExamples(examplesDir);
    const availableExamples = examples.map(ex => `- ${ex.name}`).join('\n');
    throw new Error(`Example "${filename}" not found.\n\nAvailable examples:\n${availableExamples}`);
  }
}

export async function createCodeExamplesTool(config: CodeExamplesToolConfig): Promise<Tool<any, any>> {
  const { name, description, examplesDir } = config;

  // Get initial examples for the description
  const initialExamples = await listCodeExamples(examplesDir);
  const examplesListing =
    initialExamples.length > 0
      ? '\n\nAvailable examples: ' + initialExamples.map(ex => ex.name).join(', ')
      : '\n\nNo examples available yet.';

  const examplesSchema = z.object({
    example: z
      .string()
      .optional()
      .describe(
        'Name of the specific example to fetch. If not provided, lists all available examples.' + examplesListing,
      ),
  });

  type ExamplesParams = z.infer<typeof examplesSchema>;

  return {
    name,
    description,
    parameters: examplesSchema,
    execute: async (args: ExamplesParams, _context: Context<any>) => {
      if (!args.example) {
        const examples = await listCodeExamples(examplesDir);
        return ['Available code examples:', '', ...examples.map(ex => `- ${ex.name}`)].join('\n');
      }

      const filename = args.example.endsWith('.md') ? args.example : `${args.example}.md`;
      const content = await readCodeExample(examplesDir, filename);
      return content;
    },
  };
}
