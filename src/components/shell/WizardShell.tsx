"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { parseYaml } from "@/lib/yaml";
import { validateConfig } from "@/lib/validation";
import { useWizardStore } from "@/store/wizardStore";
import { YamlPreview } from "@/components/wizard/YamlPreview";
import { FormRenderer } from "@/components/form/FormRenderer";
import { FORM_SECTIONS } from "@/lib/form/sectionRegistry";

export function WizardShell(): JSX.Element {
  const { mode, setMode, config, yaml } = useWizardStore();
  const parsed = useMemo(() => parseYaml(yaml), [yaml]);
  const validation = useMemo(() => validateConfig(parsed.json), [parsed.json]);
  const issues = validation.errors ?? [];
  const parseErrors = parsed.errors ?? [];
  const parseWarnings = parsed.warnings ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-1 items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {config.schema.toUpperCase()} Schema
              </p>
              <h1 className="text-lg font-semibold">{config.name}</h1>
              <p className="text-xs text-muted-foreground">Version {config.version}</p>
            </div>
            <Input
              className="w-60"
              placeholder="Search fields, commands, or docs..."
              aria-label="Search wizard"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Import</Button>
            <Button variant="outline">Export</Button>
            <Button>Presets</Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-muted/40 p-4 lg:block">
          <p className="text-sm font-medium text-muted-foreground">Form Sections</p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {FORM_SECTIONS.map((section) => (
              <li
                key={section.id}
                className="rounded-md px-3 py-2 transition-colors hover:bg-background hover:text-foreground"
              >
                {section.title}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-muted-foreground">Other Panels</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li className="rounded-md px-3 py-2 text-muted-foreground/80">Block Palette (coming soon)</li>
            <li className="rounded-md px-3 py-2 text-muted-foreground/80">Presets Library</li>
          </ul>
        </aside>

        <main className="flex-1 overflow-y-auto border-border bg-background">
          <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)} className="h-full">
            <TabsList className="sticky top-0 z-10 flex w-full justify-start border-b border-border bg-background px-6">
              <TabsTrigger value="form">Form Mode</TabsTrigger>
              <TabsTrigger value="blocks">Block Mode</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="p-6">
              <FormRenderer />
            </TabsContent>
            <TabsContent value="blocks" className="p-6">
              <section className="rounded-xl border border-dashed border-primary/50 bg-card/40 p-6 text-sm text-muted-foreground">
                <h2 className="text-base font-semibold text-foreground">Block mode</h2>
                <p className="mt-3 leading-relaxed">
                  Visual canvas and block palette will enable drag-and-drop authoring. Blocks mirror schema
                  structures (models, prompts, rules, context providers, MCP servers, docs, data).
                </p>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Coming in milestone M3.
                </p>
              </section>
            </TabsContent>
          </Tabs>
        </main>

        <aside className="hidden w-[360px] shrink-0 border-l border-border bg-card/60 p-6 lg:block">
          <div className="flex h-full flex-col gap-4">
            <header>
              <h2 className="text-sm font-semibold text-muted-foreground">Live YAML</h2>
              <p className="text-xs text-muted-foreground">
                The YAML preview renders configuration updates in real-time.
              </p>
            </header>
            <YamlPreview value={yaml} ariaLabel="Continue configuration YAML preview" />
            <footer className="text-xs text-muted-foreground">
              {parseErrors.length > 0 ? (
                <ul className="space-y-2">
                  {parseErrors.map((error, index) => (
                    <li key={`parse-${index}`} className="rounded border border-destructive/40 bg-destructive/10 p-2 text-destructive">
                      <p className="font-semibold">YAML Parse Error</p>
                      <p>{error.message}</p>
                    </li>
                  ))}
                </ul>
              ) : issues.length > 0 ? (
                <ul className="space-y-2">
                  {issues.map((error, index) => (
                    <li key={`schema-${index}`} className="rounded border border-destructive/40 bg-destructive/10 p-2 text-destructive">
                      <p className="font-semibold">{error.instancePath || "root"}</p>
                      <p>{error.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-2">
                  <p className="text-emerald-400">Configuration is valid.</p>
                  {parseWarnings.length > 0 ? (
                    <ul className="space-y-1 text-yellow-300">
                      {parseWarnings.map((warning, index) => (
                        <li key={`warn-${index}`}>
                          YAML warning: {warning.message}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WizardShell;
