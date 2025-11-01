import { z } from "zod";

import { ConfigSchema, type Config } from "@/schema";

export const ConfigFormSchema = ConfigSchema.extend({
  version: z.string()
});

export type ConfigFormValues = z.infer<typeof ConfigFormSchema>;

export function toFormValues(config: Config): ConfigFormValues {
  const version = typeof config.version === "number" ? config.version.toString() : config.version;
  return {
    ...config,
    version
  };
}

export function toConfigDraft(values: ConfigFormValues): Config {
  const base = {
    name: typeof values.name === "string" ? values.name.trim() : "",
    version: typeof values.version === "string" ? values.version.trim() : "",
    schema: "v1" as Config["schema"]
  } satisfies Pick<Config, "name" | "version" | "schema">;

  return {
    ...base,
    ...(values.models && values.models.length > 0 ? { models: values.models } : {}),
    ...(values.context && values.context.length > 0 ? { context: values.context } : {}),
    ...(values.rules && values.rules.length > 0 ? { rules: values.rules } : {}),
    ...(values.prompts && values.prompts.length > 0 ? { prompts: values.prompts } : {}),
    ...(values.docs && values.docs.length > 0 ? { docs: values.docs } : {}),
    ...(values.mcpServers && values.mcpServers.length > 0 ? { mcpServers: values.mcpServers } : {}),
    ...(values.data && values.data.length > 0 ? { data: values.data } : {})
  } as Config;
}
