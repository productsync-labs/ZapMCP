import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Recursively scan a directory for TypeScript files
 */
async function scanDirectory(
  basePath: string,
  currentPath: string,
  files: { path: string; content: string }[]
) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      await scanDirectory(basePath, fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const content = await fs.readFile(fullPath, "utf-8");
      files.push({
        path: relativePath,
        content,
      });
    }
  }
}

/**
 * Get the appropriate code fence language based on file extension
 */
function getFileType(filePath: string): string {
  if (filePath === "package.json") return "json";
  if (filePath.endsWith(".ts")) return "typescript";
  return "";
}

async function main() {
  const TEMP_DIR = path.join("tmp", "redis-js");
  const EXAMPLES_DIR = path.join(TEMP_DIR, "examples");

  try {
    // Create tmp directory if it doesn't exist
    try {
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
    } catch {}
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Clone the repository
    console.log("Cloning repository...");
    execSync(`git clone https://github.com/upstash/redis-js ${TEMP_DIR}`, {
      stdio: "inherit",
    });

    // Create contents/code-examples directory if it doesn't exist
    const TARGET_DIR = path.join("contents", "code-examples");
    try {
      await fs.rm(TARGET_DIR, { recursive: true, force: true });
    } catch {}
    await fs.mkdir(TARGET_DIR, { recursive: true });

    const examples = await fs.readdir(EXAMPLES_DIR, { withFileTypes: true });
    const exampleDirs = examples.filter((entry) => entry.isDirectory());

    for (const dir of exampleDirs) {
      const examplePath = path.join(EXAMPLES_DIR, dir.name);
      const outputFile = path.join(TARGET_DIR, `${dir.name}.md`);

      // Collect all relevant files
      const files: { path: string; content: string }[] = [];

      // First add package.json if it exists
      try {
        const packageJson = await fs.readFile(
          path.join(examplePath, "package.json"),
          "utf-8"
        );
        files.push({
          path: "package.json",
          content: packageJson,
        });
      } catch {}

      await scanDirectory(examplePath, examplePath, files);

      // If we found any files (beyond package.json), generate markdown and check line count
      if (files.length > 1) {
        const output = files
          .map(
            (file) =>
              `### ${file.path}\n\`\`\`${getFileType(file.path)}\n${file.content}\n\`\`\`\n`
          )
          .join("\n");

        const totalLines = output.split("\n").length;

        // Skip if total lines would exceed 500
        if (totalLines > 500) {
          console.log(
            `Skipping ${dir.name}: ${totalLines} lines exceeds limit of 500`
          );
          continue;
        }

        await fs.writeFile(outputFile, output, "utf-8");
        console.log(`Generated ${dir.name}.md with ${totalLines} lines`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
