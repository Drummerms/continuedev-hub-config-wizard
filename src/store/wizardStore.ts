import { create } from "zustand";

import { ConfigSchema, type Config } from "@/schema";
import { stringifyYaml } from "@/lib/yaml";

export type WizardMode = "form" | "blocks";

export interface WizardState {
  readonly mode: WizardMode;
  readonly config: Config;
  readonly yaml: string;
  readonly setMode: (mode: WizardMode) => void;
  readonly setConfig: (config: Config) => void;
  readonly setYaml: (yaml: string) => void;
  readonly reset: () => void;
}

const DEFAULT_CONFIG: Config = ConfigSchema.parse({
  name: "Untitled Config",
  version: "0.0.1",
  schema: "v1"
});

export const useWizardStore = create<WizardState>((set) => ({
  mode: "form",
  config: DEFAULT_CONFIG,
  yaml: stringifyYaml(DEFAULT_CONFIG),
  setMode: (mode) => set({ mode }),
  setConfig: (config) =>
    set(() => ({
      config,
      yaml: stringifyYaml(config)
    })),
  setYaml: (yaml) => set({ yaml }),
  reset: () =>
    set({
      mode: "form",
      config: DEFAULT_CONFIG,
      yaml: stringifyYaml(DEFAULT_CONFIG)
    })
}));

