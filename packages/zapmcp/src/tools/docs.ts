import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { Tool, Context } from '../types.js';

interface DocsToolConfig {
  name: string;
  description: string;
  docsDir: string;
}

// Helper function to list documentation files
async function listDocs(docsDir: string): Promise<Array<{ name: string; path: string }>> {
  try {
    const files = await fs.readdir(docsDir);
    return files
      .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
      .map(f => ({
        name: f.replace(/\.(md|mdx)$/, ''),
        path: f,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

// Helper function to read a documentation file
async function readDoc(docsDir: string, filename: string): Promise<string> {
  // Handle both .md and .mdx extensions
  const possibleExtensions = ['.md', '.mdx'];
  let filePath = path.join(docsDir, filename);
  
  // If no extension provided, try both .md and .mdx
  if (!possibleExtensions.some(ext => filename.endsWith(ext))) {
    for (const ext of possibleExtensions) {
      try {
        const content = await fs.readFile(filePath + ext, 'utf-8');
        return content;
      } catch {
        continue;
      }
    }
  } else {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      // If file not found, continue to error handling
    }
  }

  // If we get here, file wasn't found
  const docs = await listDocs(docsDir);
  const availableDocs = docs.map(doc => `- ${doc.name}`).join('\n');
  throw new Error(`Documentation "${filename}" not found.\n\nAvailable documentation:\n${availableDocs}`);
}

export async function createDocsTool(config: DocsToolConfig): Promise<Tool<any, any>> {
  const { name, description, docsDir } = config;

  // Get initial docs for the description
  const initialDocs = await listDocs(docsDir);
  const docsListing =
    initialDocs.length > 0
      ? '\n\nAvailable documentation: ' + initialDocs.map(doc => doc.name).join(', ')
      : '\n\nNo documentation available yet.';

  const docsSchema = z.object({
    doc: z
      .string()
      .optional()
      .describe(
        'Name or path of the specific documentation to fetch. If not provided, lists all available documentation.' + docsListing,
      ),
  });

  type DocsParams = z.infer<typeof docsSchema>;

  return {
    name,
    description,
    parameters: docsSchema,
    execute: async (args: DocsParams, _context: Context<any>) => {
      if (!args.doc) {
        const docs = await listDocs(docsDir);
        return ['Available documentation:', '', ...docs.map(doc => `- ${doc.name}`)].join('\n');
      }

      const content = await readDoc(docsDir, args.doc);
      return content;
    },
  };
} 