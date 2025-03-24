import { FastMCP, Tool } from "zapmcp";

// Create a new FastMCP server
const server = new FastMCP({
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

// Start the server
server.start({
  transportType: "sse",
  sse: {
    endpoint: "/mcp",
    port: 3000,
  }
});

console.log("Server is running on http://localhost:3000/mcp"); 