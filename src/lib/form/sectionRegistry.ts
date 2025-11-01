export type FieldControlType = "text" | "textarea" | "select" | "toggle";

export interface FieldConfig {
  readonly path: string;
  readonly label: string;
  readonly description?: string;
  readonly placeholder?: string;
  readonly type?: FieldControlType;
  readonly options?: readonly { readonly label: string; readonly value: string }[];
  readonly required?: boolean;
}

export interface FormSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly fields: readonly FieldConfig[];
  readonly helpText?: string;
}

export const FORM_SECTIONS: readonly FormSection[] = [
  {
    id: "project",
    title: "Project",
    description: "General metadata for this configuration.",
    helpText: "Name, version, and schema are required before adding models or context.",
    fields: [
      {
        path: "name",
        label: "Configuration Name",
        description: "Displayed to teammates inside Continue clients.",
        placeholder: "My Continue Config",
        required: true
      },
      {
        path: "version",
        label: "Version",
        description: "Semantic version to track revisions.",
        placeholder: "0.0.1",
        required: true
      },
      {
        path: "schema",
        label: "Schema Version",
        description: "Currently Continue supports only v1.",
        type: "select",
        options: [{ label: "v1", value: "v1" }],
        required: true
      }
    ]
  },
  {
    id: "models",
    title: "Models",
    description:
      "Configure chat, autocomplete, embeddings, and rerank models. Full editor coming soon.",
    fields: []
  },
  {
    id: "context",
    title: "Context Providers",
    description: "Select built-in providers that supply context to model prompts.",
    fields: []
  },
  {
    id: "rules",
    title: "Rules",
    description: "Inline guardrails or references to shared rule sets.",
    fields: []
  },
  {
    id: "prompts",
    title: "Prompts",
    description: "Inline prompt definitions or reusable prompt references.",
    fields: []
  },
  {
    id: "docs",
    title: "Docs",
    description: "Link documentation sources to enable retrieval-augmented responses.",
    fields: []
  },
  {
    id: "mcp",
    title: "MCP Servers",
    description: "Configure MCP tool servers available to the assistant.",
    fields: []
  },
  {
    id: "data",
    title: "Data Destinations",
    description: "Set up destinations for analytics and dev data.",
    fields: []
  }
];
