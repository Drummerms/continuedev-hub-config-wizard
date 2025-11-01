import { z } from "zod";

export const Roles = z.enum([
  "chat",
  "autocomplete",
  "embed",
  "rerank",
  "edit",
  "apply",
  "summarize"
]);

export const Capabilities = z.enum(["tool_use", "image_input"]);

const CompletionOptions = z
  .object({
    contextLength: z.number().int().positive().optional(),
    maxTokens: z.number().int().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
    topP: z.number().min(0).max(1).optional(),
    topK: z.number().int().min(1).optional(),
    stop: z.array(z.string()).optional(),
    reasoning: z.boolean().optional(),
    reasoningBudgetTokens: z.number().int().positive().optional()
  })
  .strict();

const RequestOptions = z
  .object({
    timeout: z.number().int().positive().optional(),
    verifySsl: z.boolean().optional(),
    caBundlePath: z.string().optional(),
    proxy: z.string().url().optional(),
    headers: z.record(z.any()).optional(),
    extraBodyProperties: z.record(z.any()).optional(),
    noProxy: z.array(z.string()).optional(),
    clientCertificate: z
      .object({
        cert: z.string(),
        key: z.string(),
        passphrase: z.string().optional()
      })
      .optional()
  })
  .strict();

const EmbedOptions = z
  .object({
    maxChunkSize: z.number().int().min(128).optional(),
    maxBatchSize: z.number().int().min(1).optional()
  })
  .strict();

const AutocompleteOptions = z
  .object({
    disable: z.boolean().optional(),
    maxPromptTokens: z.number().int().positive().optional(),
    debounceDelay: z.number().int().min(0).optional(),
    modelTimeout: z.number().int().min(0).optional(),
    maxSuffixPercentage: z.number().min(0).max(1).optional(),
    prefixPercentage: z.number().min(0).max(1).optional(),
    transform: z.boolean().optional(),
    template: z.string().optional(),
    onlyMyCode: z.boolean().optional(),
    useCache: z.boolean().optional(),
    useImports: z.boolean().optional(),
    useRecentlyEdited: z.boolean().optional(),
    useRecentlyOpened: z.boolean().optional()
  })
  .strict();

const ChatOptions = z
  .object({
    baseSystemMessage: z.string().optional(),
    baseAgentSystemMessage: z.string().optional(),
    basePlanSystemMessage: z.string().optional()
  })
  .strict();

const PromptTemplates = z
  .object({
    chat: z.string().optional(),
    edit: z.string().optional(),
    apply: z.string().optional(),
    autocomplete: z.string().optional()
  })
  .partial()
  .strict();

const ExplicitModel = z
  .object({
    name: z.string(),
    provider: z.string(),
    model: z.string(),
    apiBase: z.string().url().optional(),
    apiKey: z.string().optional(),
    useLegacyCompletionsEndpoint: z.boolean().optional(),
    roles: z.array(Roles).default(["chat", "edit", "apply", "summarize"]).optional(),
    capabilities: z.array(Capabilities).optional(),
    maxStopWords: z.number().int().min(0).optional(),
    promptTemplates: PromptTemplates.optional(),
    chatOptions: ChatOptions.optional(),
    embedOptions: EmbedOptions.optional(),
    defaultCompletionOptions: CompletionOptions.optional(),
    requestOptions: RequestOptions.optional(),
    autocompleteOptions: AutocompleteOptions.optional()
  })
  .strict();

const ReferencedModel = z
  .object({
    uses: z.string(),
    with: z.record(z.any()).optional(),
    override: ExplicitModel.partial().optional()
  })
  .strict();

export const ModelItem = z.union([ExplicitModel, ReferencedModel]);

export const BuiltInContextProvider = z.enum([
  "file",
  "code",
  "diff",
  "http",
  "terminal",
  "open",
  "clipboard",
  "tree",
  "problems",
  "debugger",
  "repo-map",
  "currentFile",
  "os"
]);

export const ContextItem = z
  .object({
    provider: BuiltInContextProvider,
    name: z.string().optional(),
    params: z.record(z.any()).optional()
  })
  .strict();

const RuleInline = z.string();
const RuleRef = z
  .object({
    uses: z.string()
  })
  .strict();

export const RuleItem = z.union([RuleInline, RuleRef]);

export const PromptInline = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    prompt: z.string(),
    invokable: z.boolean().optional()
  })
  .strict();

const PromptRef = z
  .object({
    uses: z.string()
  })
  .strict();

export const PromptItem = z.union([PromptInline, PromptRef]);

export const DocsItem = z
  .object({
    name: z.string(),
    startUrl: z.string().url(),
    favicon: z.string().url().optional(),
    useLocalCrawling: z.boolean().optional()
  })
  .strict();

export const McpServer = z
  .object({
    name: z.string(),
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
    cwd: z.string().optional(),
    requestOptions: RequestOptions.optional(),
    connectionTimeout: z.number().int().positive().optional()
  })
  .strict();

export const DataItem = z
  .object({
    name: z.string(),
    destination: z.string(),
    schema: z.enum(["0.1.0", "0.2.0"]),
    events: z.array(z.string()).optional(),
    level: z.enum(["all", "noCode"]).default("all").optional(),
    apiKey: z.string().optional(),
    requestOptions: RequestOptions.optional()
  })
  .strict()
  .refine(
    (value) => value.destination.startsWith("file://") || /^https?:\/\//.test(value.destination),
    {
      message: "destination must be file:///... or http(s)://...",
      path: ["destination"]
    },
  );

export const ConfigSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    version: z.union([z.string(), z.number()]),
    schema: z.literal("v1"),
    models: z.array(ModelItem).optional(),
    context: z.array(ContextItem).optional(),
    rules: z.array(RuleItem).optional(),
    prompts: z.array(PromptItem).optional(),
    docs: z.array(DocsItem).optional(),
    mcpServers: z.array(McpServer).optional(),
    data: z.array(DataItem).optional()
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

