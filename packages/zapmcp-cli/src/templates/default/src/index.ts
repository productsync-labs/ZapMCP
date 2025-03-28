import { ZapMCP } from "zapmcp";

// Create a new ZapMCP server
const server = new ZapMCP({
  name: "project-name",
  version: "0.1.0",
});

// Add a simple tool
server.addTool({
  name: "hello",
  description: "A simple hello world tool",
  execute: async () => {
    return "Hello from project-name!";
  }
});

export { server };
