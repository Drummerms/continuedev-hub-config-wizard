import { describe, expect, it } from "vitest";

import { ConfigSchema } from "@/schema";
import { toConfigDraft, toFormValues } from "@/lib/form/transformers";

describe("form transformers", () => {
  const baseConfig = ConfigSchema.parse({
    name: "Sample",
    version: 1,
    schema: "v1"
  });

  it("converts config to form values with string version", () => {
    const result = toFormValues(baseConfig);

    expect(result.version).toBe("1");
    expect(result.name).toBe("Sample");
  });

  it("produces config draft without blank inputs", () => {
    const result = toConfigDraft({
      ...baseConfig,
      version: "2.0.0",
      name: "",
      docs: []
    });

    expect(result.version).toBe("2.0.0");
    expect(result.name).toBe("");
    expect(result).not.toHaveProperty("docs");
  });

  it("retains optional collections when populated", () => {
    const result = toConfigDraft({
      ...baseConfig,
      docs: [
        {
          name: "Continue",
          startUrl: "https://docs.continue.dev"
        }
      ],
      context: [{ provider: "code" }]
    });

    expect(result.docs).toHaveLength(1);
    expect(result.context).toHaveLength(1);
  });
});
