import { ZapMCP } from "zapmcp";

// Create a new ZapMCP server
const server = new ZapMCP({
  name: "project-name",
  version: "0.1.0",
});

// Add a simple tool
server.addTool({
  name: "temperature",
  description: "A simple tool to get the current temperature",
  execute: async () => {
    return "It's 42 degrees";
  }
});

export { server };
