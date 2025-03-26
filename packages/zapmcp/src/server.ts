import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startSSEServer } from "mcp-proxy";
import { createCodeExamplesTool } from './tools/code-examples.js';

import { ZapMCPSession } from "./session.js";
import { ZapMCPEventEmitter } from "./events.js";
import {
  Authenticate,
  InputPrompt,
  InputPromptArgument,
  InputResourceTemplate,
  InputResourceTemplateArgument,
  Resource,
  ServerOptions,
  SSEServer,
  Tool,
  ToolParameters,
} from "./types.js";

export class ZapMCP<
  T extends Record<string, unknown> | undefined = undefined,
> extends ZapMCPEventEmitter {
  #options: ServerOptions<T>;
  #prompts: InputPrompt[] = [];
  #resources: Resource[] = [];
  #resourcesTemplates: InputResourceTemplate[] = [];
  #sessions: ZapMCPSession<T>[] = [];
  #sseServer: SSEServer | null = null;
  #tools: Tool<T>[] = [];
  #authenticate: Authenticate<T> | undefined;

  constructor(public options: ServerOptions<T>) {
    super();

    this.#options = options;
    this.#authenticate = options.authenticate;
  }

  public get sessions(): ZapMCPSession<T>[] {
    return this.#sessions;
  }

  /**
   * Adds a tool that lists code examples.
   * @param config - Configuration object for the code examples tool
   * @param config.name - Name of the tool (optional, defaults to "codeExamples")
   * @param config.description - Description of what the tool does (optional, defaults to "Get code examples from the examples directory. Without a specific example name, lists all available examples. With an example name, returns the full source code of that example.")
   * @param config.examplesDir - Directory path where example files are stored
   */ 
  public async addCodeExamples(config: {
    name?: string;
    description?: string;
    examplesDir: string;
  }) {
    const tool = await createCodeExamplesTool({
      name: config.name ?? 'codeExamples',
      description: config.description ?? 'Get code examples from the examples directory. Without a specific example name, lists all available examples. With an example name, returns the full source code of that example.',
      examplesDir: config.examplesDir,
    });
    this.addTool(tool);
  }

  /**
   * Adds a tool to the server.
   */
  public addTool<Params extends ToolParameters>(tool: Tool<T, Params>) {
    this.#tools.push(tool as unknown as Tool<T>);
  }

  /**
   * Adds a resource to the server.
   */
  public addResource(resource: Resource) {
    this.#resources.push(resource);
  }

  /**
   * Adds a resource template to the server.
   */
  public addResourceTemplate<
    const Args extends InputResourceTemplateArgument[],
  >(resource: InputResourceTemplate<Args>) {
    this.#resourcesTemplates.push(resource);
  }

  /**
   * Adds a prompt to the server.
   */
  public addPrompt<const Args extends InputPromptArgument[]>(
    prompt: InputPrompt<Args>
  ) {
    this.#prompts.push(prompt);
  }

  /**
   * Starts the server.
   */
  public async start(
    options:
      | { transportType: "stdio" }
      | {
          transportType: "sse";
          sse: { endpoint: `/${string}`; port: number };
        } = {
      transportType: "stdio",
    }
  ) {
    if (options.transportType === "stdio") {
      const transport = new StdioServerTransport();

      const session = new ZapMCPSession<T>({
        name: this.#options.name,
        version: this.#options.version,
        tools: this.#tools,
        resources: this.#resources,
        resourcesTemplates: this.#resourcesTemplates,
        prompts: this.#prompts,
      });

      await session.connect(transport);

      this.#sessions.push(session);

      this.emit("connect", {
        session,
      });
    } else if (options.transportType === "sse") {
      this.#sseServer = await startSSEServer<ZapMCPSession<T>>({
        endpoint: options.sse.endpoint as `/${string}`,
        port: options.sse.port,
        createServer: async (request) => {
          let auth: T | undefined;

          if (this.#authenticate) {
            auth = await this.#authenticate(request);
          }

          return new ZapMCPSession<T>({
            auth,
            name: this.#options.name,
            version: this.#options.version,
            tools: this.#tools,
            resources: this.#resources,
            resourcesTemplates: this.#resourcesTemplates,
            prompts: this.#prompts,
          });
        },
        onClose: (session) => {
          this.emit("disconnect", {
            session,
          });
        },
        onConnect: async (session) => {
          this.#sessions.push(session);

          this.emit("connect", {
            session,
          });
        },
      });

      console.info(
        `server is running on SSE at http://localhost:${options.sse.port}${options.sse.endpoint}`
      );
    } else {
      throw new Error("Invalid transport type");
    }
  }

  /**
   * Stops the server.
   */
  public async stop() {
    if (this.#sseServer) {
      this.#sseServer.close();
    }
  }
}
