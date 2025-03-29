import { ZapMCP } from "zapmcp";

// Create a new ZapMCP server
const server = new ZapMCP({
  name: "Upstash Redis Documentation Server",
  version: "0.1.0",
});

// Add docs for upstash redis
await server.addCodeExamples({
  name: "upstashExamples",
  description: "Get code examples from the Upstash Redis examples directory. Without a specific example name, lists all available examples. With an example name, returns the full source code of that example.",
  examplesDir: "contents/code-examples",
});

export { server };
