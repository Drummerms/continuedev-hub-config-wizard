export interface FieldMetadata {
  readonly path: string;
  readonly label: string;
  readonly description?: string;
  readonly docHref?: string;
  readonly example?: string;
}

export const FIELD_METADATA: readonly FieldMetadata[] = [
  {
    path: "name",
    label: "Project Name",
    description: "Human readable name for this configuration. Displayed within Continue clients.",
    docHref: "https://docs.continue.dev/configuration/config-yaml"
  },
  {
    path: "version",
    label: "Version",
    description: "Semantic version for tracking your configuration revisions.",
    docHref: "https://docs.continue.dev/configuration/config-yaml#version"
  },
  {
    path: "schema",
    label: "Schema Version",
    description: "Configuration schema identifier. Currently Continue supports only v1."
  },
  {
    path: "models",
    label: "Models",
    description:
      "LLM definitions used for chat, autocomplete, embeddings, reranking, and tool interaction."
  },
  {
    path: "context",
    label: "Context Providers",
    description: "Built-in providers that gather runtime context such as files, diffs, and HTTP."
  },
  {
    path: "rules",
    label: "Rules",
    description: "Inline guardrails or references to shared rulesets that influence assistant tone."
  },
  {
    path: "prompts",
    label: "Prompts",
    description: "Inline prompt definitions or references to shared prompt assets from the hub."
  },
  {
    path: "docs",
    label: "Docs Sites",
    description: "Link documentation sources to enable in-product retrieval across your teams."
  },
  {
    path: "mcpServers",
    label: "MCP Servers",
    description: "Configure Model Context Protocol servers that extend the assistant with tools."
  },
  {
    path: "data",
    label: "Data Destinations",
    description: "Ship anonymized events for analytics or local dev insights via the data API."
  }
];

export const FIELD_METADATA_BY_PATH = new Map(FIELD_METADATA.map((meta) => [meta.path, meta]));

