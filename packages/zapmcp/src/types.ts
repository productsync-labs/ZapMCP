import { z } from "zod";
import http from "http";
import { Root } from "@modelcontextprotocol/sdk/types.js";
import { ZapMCPSession } from "./session.js";

export type SSEServer = {
  close: () => Promise<void>;
};

export type ZapMCPEvents<T extends ZapMCPSessionAuth> = {
  connect: (event: { session: ZapMCPSession<T> }) => void;
  disconnect: (event: { session: ZapMCPSession<T> }) => void;
};

export type ZapMCPSessionEvents = {
  rootsChanged: (event: { roots: Root[] }) => void;
  error: (event: { error: Error }) => void;
};

export type ZapMCPSessionAuth = Record<string, unknown> | undefined;

export type Extra = unknown;

export type Extras = Record<string, Extra>;

export type ToolParameters = z.ZodTypeAny;

export type Literal = boolean | null | number | string | undefined;

export type SerializableValue =
  | Literal
  | SerializableValue[]
  | { [key: string]: SerializableValue };

export type Progress = {
  /**
   * The progress thus far. This should increase every time progress is made, even if the total is unknown.
   */
  progress: number;
  /**
   * Total number of items to process (or total progress required), if known.
   */
  total?: number;
};

export type Context<T extends ZapMCPSessionAuth> = {
  session: T | undefined;
  reportProgress: (progress: Progress) => Promise<void>;
  log: {
    debug: (message: string, data?: SerializableValue) => void;
    error: (message: string, data?: SerializableValue) => void;
    info: (message: string, data?: SerializableValue) => void;
    warn: (message: string, data?: SerializableValue) => void;
  };
};

export type TextContent = {
  type: "text";
  text: string;
};

export const TextContentZodSchema = z
  .object({
    type: z.literal("text"),
    /**
     * The text content of the message.
     */
    text: z.string(),
  })
  .strict() satisfies z.ZodType<TextContent>;

export type ImageContent = {
  type: "image";
  data: string;
  mimeType: string;
};

export const ImageContentZodSchema = z
  .object({
    type: z.literal("image"),
    /**
     * The base64-encoded image data.
     */
    data: z.string().base64(),
    /**
     * The MIME type of the image. Different providers may support different image types.
     */
    mimeType: z.string(),
  })
  .strict() satisfies z.ZodType<ImageContent>;

export type Content = TextContent | ImageContent;

export const ContentZodSchema = z.discriminatedUnion("type", [
  TextContentZodSchema,
  ImageContentZodSchema,
]) satisfies z.ZodType<Content>;

export type ContentResult = {
  content: Content[];
  isError?: boolean;
};

export const ContentResultZodSchema = z
  .object({
    content: ContentZodSchema.array(),
    isError: z.boolean().optional(),
  })
  .strict() satisfies z.ZodType<ContentResult>;

export type Completion = {
  values: string[];
  total?: number;
  hasMore?: boolean;
};

/**
 * https://github.com/modelcontextprotocol/typescript-sdk/blob/3164da64d085ec4e022ae881329eee7b72f208d4/src/types.ts#L983-L1003
 */
export const CompletionZodSchema = z.object({
  /**
   * An array of completion values. Must not exceed 100 items.
   */
  values: z.array(z.string()).max(100),
  /**
   * The total number of completion options available. This can exceed the number of values actually sent in the response.
   */
  total: z.optional(z.number().int()),
  /**
   * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
   */
  hasMore: z.optional(z.boolean()),
}) satisfies z.ZodType<Completion>;

export type Tool<
  T extends ZapMCPSessionAuth,
  Params extends ToolParameters = ToolParameters,
> = {
  name: string;
  description: string;
  parameters: Params;
  execute: (args: z.infer<Params>, context: Context<T>) => Promise<string>;
};

export type ResourceResult =
  | {
      text: string;
    }
  | {
      blob: string;
    };

export type InputResourceTemplateArgument = Readonly<{
  name: string;
  description?: string;
  complete?: ArgumentValueCompleter;
}>;

export type ResourceTemplateArgument = Readonly<{
  name: string;
  description?: string;
  complete?: ArgumentValueCompleter;
}>;

export type ResourceTemplate<
  Arguments extends ResourceTemplateArgument[] = ResourceTemplateArgument[],
> = {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
  arguments: Arguments;
  complete?: (name: string, value: string) => Promise<Completion>;
  load: (
    args: ResourceTemplateArgumentsToObject<Arguments>
  ) => Promise<ResourceResult>;
};

export type ResourceTemplateArgumentsToObject<T extends { name: string }[]> = {
  [K in T[number]["name"]]: string;
};

export type InputResourceTemplate<
  Arguments extends ResourceTemplateArgument[] = ResourceTemplateArgument[],
> = {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
  arguments: Arguments;
  load: (
    args: ResourceTemplateArgumentsToObject<Arguments>
  ) => Promise<ResourceResult>;
};

export type Resource = {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  load: () => Promise<ResourceResult | ResourceResult[]>;
  complete?: (name: string, value: string) => Promise<Completion>;
};

export type ArgumentValueCompleter = (value: string) => Promise<Completion>;

export type InputPromptArgument = Readonly<{
  name: string;
  description?: string;
  required?: boolean;
  complete?: ArgumentValueCompleter;
  enum?: string[];
}>;

export type PromptArgumentsToObject<
  T extends { name: string; required?: boolean }[],
> = {
  [K in T[number]["name"]]: Extract<
    T[number],
    { name: K }
  >["required"] extends true
    ? string
    : string | undefined;
};

export type InputPrompt<
  Arguments extends InputPromptArgument[] = InputPromptArgument[],
  Args = PromptArgumentsToObject<Arguments>,
> = {
  name: string;
  description?: string;
  arguments?: InputPromptArgument[];
  load: (args: Args) => Promise<string>;
};

export type PromptArgument = Readonly<{
  name: string;
  description?: string;
  required?: boolean;
  complete?: ArgumentValueCompleter;
  enum?: string[];
}>;

export type Prompt<
  Arguments extends PromptArgument[] = PromptArgument[],
  Args = PromptArgumentsToObject<Arguments>,
> = {
  arguments?: PromptArgument[];
  complete?: (name: string, value: string) => Promise<Completion>;
  description?: string;
  load: (args: Args) => Promise<string>;
  name: string;
};

export type ServerOptions<T extends ZapMCPSessionAuth> = {
  name: string;
  version: `${number}.${number}.${number}`;
  authenticate?: Authenticate<T>;
};

export type LoggingLevel =
  | "debug"
  | "info"
  | "notice"
  | "warning"
  | "error"
  | "critical"
  | "alert"
  | "emergency";

export type SamplingResponse = {
  model: string;
  stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string;
  role: "user" | "assistant";
  content: TextContent | ImageContent;
};

export type Authenticate<T> = (request: http.IncomingMessage) => Promise<T>;
