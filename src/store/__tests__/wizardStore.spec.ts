import { describe, expect, it } from "vitest";

import { useWizardStore } from "@/store/wizardStore";

describe("useWizardStore", () => {
  it("initializes with default config and yaml", () => {
    const state = useWizardStore.getState();

    expect(state.mode).toBe("form");
    expect(state.config.name).toBe("Untitled Config");
    expect(state.yaml).toContain("schema: v1");
  });

  it("updates mode", () => {
    useWizardStore.getState().setMode("blocks");
    expect(useWizardStore.getState().mode).toBe("blocks");

    useWizardStore.getState().reset();
  });
});

