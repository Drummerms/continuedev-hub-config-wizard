"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  useFormContext,
  type FieldPath,
  type UseFormRegister
} from "react-hook-form";
import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { FORM_SECTIONS, type FieldConfig } from "@/lib/form/sectionRegistry";
import {
  ConfigFormSchema,
  toConfigDraft,
  toFormValues,
  type ConfigFormValues
} from "@/lib/form/transformers";
import { stringifyYaml } from "@/lib/yaml";
import { ConfigSchema, type Config } from "@/schema";
import type { ZodType, ZodTypeDef } from "zod";
import { useWizardStore } from "@/store/wizardStore";

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

  const tabs = [
    { id: "project", label: "Project" },
    { id: "models", label: "Models" },
    { id: "context", label: "Context" },
    { id: "rules", label: "Rules" },
    { id: "prompts", label: "Prompts" },
    { id: "docs", label: "Docs" },
    { id: "mcp", label: "MCP Servers" },
    { id: "data", label: "Data" }
  ];

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

          {FORM_SECTIONS.map((section) => (
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

              {section.fields.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-primary/50 bg-background/60 p-6 text-sm text-muted-foreground">
                  Detailed controls for this section will arrive in upcoming milestones.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <FieldInput key={field.path} field={field} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Changes sync automatically. Export anytime from the toolbar.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(toFormValues(config))}
          >
            Reset to last valid config
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

interface FieldInputProps {
  readonly field: FieldConfig;
}

function FieldInput({ field }: FieldInputProps): JSX.Element {
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
        <textarea
          {...register(path)}
          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          placeholder={field.placeholder}
        />
      );
    }
    case "text":
    default: {
      return <Input placeholder={field.placeholder} {...register(path)} />;
    }
  }
}
