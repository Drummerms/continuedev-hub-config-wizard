"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import {
  Controller,
  type Control,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPath,
  type UseFormRegister
} from "react-hook-form";
import type { ZodType, ZodTypeDef } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  FORM_SECTIONS,
  type FieldConfig,
  type FormSection
} from "@/lib/form/sectionRegistry";
import {
  ConfigFormSchema,
  toConfigDraft,
  toFormValues,
  type ConfigFormValues
} from "@/lib/form/transformers";
import { stringifyYaml } from "@/lib/yaml";
import {
  BuiltInContextProvider,
  Capabilities,
  ConfigSchema,
  Roles,
  type Config
} from "@/schema";
import { useWizardStore } from "@/store/wizardStore";

const ROLE_OPTIONS = Roles.options;
const CAPABILITY_OPTIONS = Capabilities.options;
const CONTEXT_OPTIONS = BuiltInContextProvider.options;
const DATA_SCHEMA_OPTIONS = ["0.1.0", "0.2.0"] as const;
const DATA_LEVEL_OPTIONS = ["all", "noCode"] as const;

type ModelField = NonNullable<ConfigFormValues["models"]>[number];

type SectionComponent = (props: SectionComponentProps) => JSX.Element;

interface SectionComponentProps {
  readonly section: FormSection;
}

const SECTION_COMPONENTS: Partial<Record<FormSection["id"], SectionComponent>> = {
  project: ProjectSection,
  models: ModelsSection,
  context: ContextSection,
  rules: RulesSection,
  prompts: PromptsSection,
  docs: DocsSection,
  mcp: McpSection,
  data: DataSection
};

export function FormRenderer(): JSX.Element {
  const { config, setConfig, setYaml } = useWizardStore();
  const defaultValues = useMemo(() => toFormValues(config), [config]);

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(ConfigFormSchema),
    mode: "onChange",
    defaultValues
  });

  const lastSerialized = useRef(JSON.stringify(defaultValues));

  useEffect(() => {
    const serialized = JSON.stringify(defaultValues);
    if (serialized === lastSerialized.current) {
      return;
    }
    lastSerialized.current = serialized;
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!values) {
        return;
      }

      const current = values as ConfigFormValues;
      const draft = toConfigDraft(current);
      const looseSchema = ConfigSchema as unknown as ZodType<Config, ZodTypeDef, unknown>;
      const parsed = looseSchema.safeParse(draft);

      setYaml(stringifyYaml(draft));

      if (parsed.success) {
        const serialized = JSON.stringify(toFormValues(parsed.data));
        lastSerialized.current = serialized;
        setConfig(parsed.data);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, setConfig, setYaml]);

  const tabs = FORM_SECTIONS.map((section) => ({
    id: section.id,
    label: section.title
  }));

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-6">
        <Tabs defaultValue="project" className="w-full">
          <TabsList className="flex max-w-full flex-wrap gap-2 border-b border-border bg-card/40 px-2 py-2">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {FORM_SECTIONS.map((section) => {
            const SectionComponent = SECTION_COMPONENTS[section.id] ?? PlaceholderSection;
            return (
              <TabsContent
                key={section.id}
                value={section.id}
                className="rounded-xl border border-border bg-card/40 p-6"
              >
                <header className="flex flex-col gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                    {section.description !== undefined ? (
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    ) : null}
                  </div>
                  {section.helpText !== undefined ? (
                    <p className="text-xs text-muted-foreground">{section.helpText}</p>
                  ) : null}
                </header>
                <SectionComponent section={section} />
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Changes sync automatically. Export anytime from the toolbar.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(toFormValues(useWizardStore.getState().config))}
          >
            Reset to last valid config
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function ProjectSection({ section }: SectionComponentProps): JSX.Element {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {section.fields.map((field) => (
        <FieldInput key={field.path} field={field} />
      ))}
    </div>
  );
}

function ModelsSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register, setValue, getValues } = form;
  const { fields, append, remove, update } = useFieldArray<ConfigFormValues, "models">({
    control,
    name: "models"
  });

  const handleVariantChange = (index: number, variant: "explicit" | "reference"): void => {
    const replacement: ModelField =
      variant === "reference" ? createReferenceModel() : createExplicitModel();
    update(index, replacement);
  };

  const addModel = (model: ModelField): void => {
    append(model);
  };

  return (
    <div className="mt-6 space-y-4">
      {fields.length === 0 ? (
        <EmptyState
          title="No models yet"
          description="Add chat, autocomplete, and embedding providers that power your configuration."
        />
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const current = form.getValues(`models.${index}` as const);
            const variant = inferModelVariant(current ?? field);
            const displayModel = current ?? (field as Partial<ModelField>);

            return (
              <div
                key={field.id}
                className="rounded-lg border border-border bg-background/80 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {variant === "reference"
                        ? (isReferenceModelValue(displayModel) ? displayModel.uses : "Referenced model")
                        : getExplicitModelName(displayModel)}
                    </span>
                    <span>•</span>
                    <span className="uppercase tracking-wide">{variant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={variant === "explicit" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVariantChange(index, "explicit")}
                    >
                      Explicit
                    </Button>
                    <Button
                      type="button"
                      variant={variant === "reference" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVariantChange(index, "reference")}
                    >
                      Reference
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      ✕
                    </Button>
                  </div>
                </div>

                {variant === "reference" ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground">Reference</label>
                      <Input
                        placeholder="provider/model-id"
                        {...register(`models.${index}.uses` as const)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reference presets published in Continue Dev Hub.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <LabeledInput
                      label="Display name"
                      placeholder="GPT-4o"
                      {...register(`models.${index}.name` as const)}
                    />
                    <LabeledInput
                      label="Provider"
                      placeholder="openai"
                      {...register(`models.${index}.provider` as const)}
                    />
                    <LabeledInput
                      label="Model identifier"
                      placeholder="gpt-4o"
                      {...register(`models.${index}.model` as const)}
                    />
                    <LabeledInput
                      label="API base URL (optional)"
                      placeholder="https://api.openai.com/v1"
                      {...register(`models.${index}.apiBase` as const)}
                    />

                    <CommaSeparatedController
                      control={control}
                      name={`models.${index}.roles` as const}
                      label="Roles"
                      placeholder="chat, autocomplete"
                      suggestions={ROLE_OPTIONS}
                      onSuggestionsToggle={(value) => {
                        const currentRoles = getValues(`models.${index}.roles` as const);
                        const next = toggleListValue<typeof ROLE_OPTIONS[number]>(currentRoles, value);
                        setValue(`models.${index}.roles` as const, next, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                      }}
                    />

                    <CommaSeparatedController
                      control={control}
                      name={`models.${index}.capabilities` as const}
                      label="Capabilities"
                      placeholder="tool_use"
                      suggestions={CAPABILITY_OPTIONS}
                      onSuggestionsToggle={(value) => {
                        const currentCapabilities = getValues(`models.${index}.capabilities` as const);
                        const next = toggleListValue<typeof CAPABILITY_OPTIONS[number]>(currentCapabilities, value);
                        setValue(`models.${index}.capabilities` as const, next, {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => addModel(createExplicitModel())}>
          Add explicit model
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => addModel(createReferenceModel())}
        >
          Reference hub model
        </Button>
      </div>
    </div>
  );
}

function ContextSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray<ConfigFormValues, "context">({
    control,
    name: "context"
  });

  return (
    <ArraySection
      emptyTitle="No context providers yet"
      emptyDescription="Context providers collect runtime information (files, diffs, HTTP, etc.) for prompts."
      fields={fields}
      onAdd={() =>
        append({
          provider: "code",
          name: ""
        })
      }
      onRemove={remove}
      addLabel="Add context provider"
    >
      {(_field, index) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Provider</label>
            <select
              {...register(`context.${index}.provider` as const)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {CONTEXT_OPTIONS.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
          <LabeledInput
            label="Display name (optional)"
            placeholder="Repository map"
            {...register(`context.${index}.name` as const)}
          />
        </div>
      )}
    </ArraySection>
  );
}

function RulesSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray<ConfigFormValues, "rules">({
    control,
    name: "rules"
  });

  return (
    <ArraySection
      emptyTitle="No rules yet"
      emptyDescription="Rules steer the assistant toward company tone and guardrails."
      fields={fields}
      onAdd={() => append("Always be concise")}
      onRemove={remove}
      addLabel="Add rule"
    >
      {(_field, index) => (
        <Textarea
          placeholder="Always provide actionable next steps."
          {...register(`rules.${index}` as const)}
        />
      )}
    </ArraySection>
  );
}

function PromptsSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray<ConfigFormValues, "prompts">({
    control,
    name: "prompts"
  });

  return (
    <ArraySection
      emptyTitle="No prompts yet"
      emptyDescription="Create reusable prompt snippets or inline workflows for authors."
      fields={fields}
      onAdd={() =>
        append({
          name: "",
          description: "",
          prompt: "",
          invokable: false
        })
      }
      onRemove={remove}
      addLabel="Add prompt"
    >
      {(_field, index) => (
        <div className="grid gap-4 md:grid-cols-2">
          <LabeledInput
            label="Prompt name"
            placeholder="Code review checklist"
            {...register(`prompts.${index}.name` as const)}
          />
          <LabeledInput
            label="Description (optional)"
            placeholder="High-level description"
            {...register(`prompts.${index}.description` as const)}
          />
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Prompt body</label>
            <Textarea
              rows={6}
              placeholder="You are assisting with..."
              {...register(`prompts.${index}.prompt` as const)}
            />
          </div>
          <Controller
            control={control}
            name={`prompts.${index}.invokable` as const}
            defaultValue={false}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(field.value)}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background"
                />
                Expose as invokable command
              </label>
            )}
          />
        </div>
      )}
    </ArraySection>
  );
}

function DocsSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray<ConfigFormValues, "docs">({
    control,
    name: "docs"
  });

  return (
    <ArraySection
      emptyTitle="No documentation sources yet"
      emptyDescription="Link internal or public documentation so the assistant can surface relevant answers."
      fields={fields}
      onAdd={() =>
        append({
          name: "",
          startUrl: ""
        })
      }
      onRemove={remove}
      addLabel="Add docs source"
    >
      {(_field, index) => (
        <div className="grid gap-4 md:grid-cols-2">
          <LabeledInput
            label="Source name"
            placeholder="Continue Docs"
            {...register(`docs.${index}.name` as const)}
          />
          <LabeledInput
            label="Start URL"
            placeholder="https://docs.continue.dev/intro"
            {...register(`docs.${index}.startUrl` as const)}
          />
        </div>
      )}
    </ArraySection>
  );
}

function McpSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray<ConfigFormValues, "mcpServers">({
    control,
    name: "mcpServers"
  });

  return (
    <ArraySection
      emptyTitle="No MCP servers yet"
      emptyDescription="Connect Model Context Protocol servers to expose custom tools."
      fields={fields}
      onAdd={() =>
        append({
          name: "",
          command: "",
          args: []
        })
      }
      onRemove={remove}
      addLabel="Add MCP server"
    >
      {(_field, index) => (
        <div className="grid gap-4 md:grid-cols-2">
          <LabeledInput
            label="Server name"
            placeholder="sqlite"
            {...register(`mcpServers.${index}.name` as const)}
          />
          <LabeledInput
            label="Command"
            placeholder="uvx"
            {...register(`mcpServers.${index}.command` as const)}
          />
          <Controller
            control={control}
            name={`mcpServers.${index}.args` as const}
            defaultValue={[]}
            render={({ field }) => (
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Arguments (one per line)</label>
                <Textarea
                  placeholder="mcp-server-sqlite&#10;--db-path&#10;/tmp/test.db"
                  value={(field.value ?? []).join("\n")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(/\r?\n/)
                        .map((line) => line.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>
            )}
          />
        </div>
      )}
    </ArraySection>
  );
}

function DataSection(): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const { control, register } = form;
  const { fields, append, remove } = useFieldArray<ConfigFormValues, "data">({
    control,
    name: "data"
  });

  return (
    <ArraySection
      emptyTitle="No data destinations"
      emptyDescription="Send anonymized usage analytics or local development logs."
      fields={fields}
      onAdd={() =>
        append({
          name: "",
          destination: "",
          schema: "0.2.0",
          level: "all"
        })
      }
      onRemove={remove}
      addLabel="Add data destination"
    >
      {(_field, index) => (
        <div className="grid gap-4 md:grid-cols-2">
          <LabeledInput
            label="Destination name"
            placeholder="Local Dev Data"
            {...register(`data.${index}.name` as const)}
          />
          <LabeledInput
            label="Destination URL"
            placeholder="file:///Users/me/.continue/dev_data"
            {...register(`data.${index}.destination` as const)}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Schema</label>
            <select
              {...register(`data.${index}.schema` as const)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {DATA_SCHEMA_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Level</label>
            <select
              {...register(`data.${index}.level` as const)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {DATA_LEVEL_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </ArraySection>
  );
}

function PlaceholderSection({ section }: SectionComponentProps): JSX.Element {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-primary/50 bg-background/60 p-6 text-sm text-muted-foreground">
      Detailed controls for {section.title.toLowerCase()} will arrive in upcoming milestones.
    </div>
  );
}

interface ArraySectionProps<TField> {
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly fields: readonly TField[];
  readonly onAdd: () => void;
  readonly onRemove: (index: number) => void;
  readonly addLabel: string;
  readonly children: (field: TField, index: number) => JSX.Element;
}

function ArraySection<TField>({
  emptyTitle,
  emptyDescription,
  fields,
  onAdd,
  onRemove,
  addLabel,
  children
}: ArraySectionProps<TField>): JSX.Element {
  return (
    <div className="mt-6 space-y-4">
      {fields.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={(field as { id?: string }).id ?? index}
              className="rounded-lg border border-border bg-background/80 p-4 shadow-sm"
            >
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
                  ✕
                </Button>
              </div>
              {children(field, index)}
            </div>
          ))}
        </div>
      )}
      <Button type="button" onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  );
}

function EmptyState({ title, description }: { readonly title: string; readonly description: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-dashed border-primary/50 bg-background/60 p-6 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}

function FieldInput({ field }: { readonly field: FieldConfig }): JSX.Element {
  const form = useFormContext<ConfigFormValues>();
  const fieldPath = field.path as FieldPath<ConfigFormValues>;
  const fieldState = form.getFieldState(fieldPath, form.formState);
  const errorMessage = fieldState.error?.message;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        {field.label}
        {field.required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      {renderControl(field, form.register, fieldPath)}
      {field.description ? (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      ) : null}
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

function renderControl(
  field: FieldConfig,
  register: UseFormRegister<ConfigFormValues>,
  path: FieldPath<ConfigFormValues>
): JSX.Element {
  switch (field.type) {
    case "select": {
      return (
        <select
          {...register(path)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="">Select...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    case "textarea": {
      return (
        <Textarea
          placeholder={field.placeholder}
          {...register(path)}
        />
      );
    }
    case "text":
    default: {
      return <Input placeholder={field.placeholder} {...register(path)} />;
    }
  }
}

function createExplicitModel(): ModelField {
  return {
    name: "",
    provider: "",
    model: "",
    roles: ["chat"],
    capabilities: []
  } satisfies ModelField;
}

function createReferenceModel(): ModelField {
  return { uses: "" } satisfies ModelField;
}

function isReferenceModelValue(model: unknown): model is { uses: string } {
  return Boolean(model && typeof model === "object" && "uses" in model && typeof (model as { uses?: unknown }).uses === "string");
}

function inferModelVariant(value: unknown): "explicit" | "reference" {
  return isReferenceModelValue(value) ? "reference" : "explicit";
}

function getExplicitModelName(value: unknown): string {
  if (value && typeof value === "object" && "name" in value && typeof (value as { name?: unknown }).name === "string") {
    const name = (value as { name: string }).name;
    return name.trim() !== "" ? name : "New model";
  }
  return "New model";
}

function toggleListValue<T extends string>(list: readonly T[] | undefined, value: T): T[] {
  const next = new Set(list ?? []);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return Array.from(next);
}

function LabeledInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { readonly label: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input {...props} />
    </div>
  );
}

interface CommaSeparatedControllerProps<T extends string> {
  readonly control: Control<ConfigFormValues>;
  readonly name: FieldPath<ConfigFormValues>;
  readonly label: string;
  readonly placeholder?: string;
  readonly suggestions?: readonly T[];
  readonly onSuggestionsToggle?: (value: T) => void;
}

function CommaSeparatedController<T extends string>({
  control,
  name,
  label,
  placeholder,
  suggestions = [],
  onSuggestionsToggle
}: CommaSeparatedControllerProps<T>): JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field }) => (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <Input
            placeholder={placeholder}
            value={Array.isArray(field.value) ? field.value.join(", ") : ""}
            onChange={(event) => field.onChange(parseCommaSeparated(event.target.value) as T[])}
          />
          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((option) => {
                const active = Array.isArray(field.value) && field.value.includes(option);
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (onSuggestionsToggle) {
                        onSuggestionsToggle(option);
                      } else {
                        field.onChange(toggleListValue(field.value as T[] | undefined, option));
                      }
                    }}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    />
  );
}

function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
