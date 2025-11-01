import { describe, expect, it } from "vitest";

import { parseYaml, stringifyYaml } from "@/lib/yaml";

describe("yaml helpers", () => {
  const sampleYaml = `name: Sample
version: 0.0.1
schema: v1
models:
  - name: GPT-4o
    provider: openai
    model: gpt-4o
`;

  it("parses yaml into document and json", () => {
    const { doc, json, errors } = parseYaml(sampleYaml);

    expect(errors).toHaveLength(0);
    expect(doc).toBeDefined();
    expect(json).toMatchObject({
      name: "Sample",
      schema: "v1",
      models: [
        {
          name: "GPT-4o",
          provider: "openai",
          model: "gpt-4o"
        }
      ]
    });
  });

  it("stringifies json with LF newlines by default", () => {
    const { doc, json } = parseYaml(sampleYaml);
    const output = stringifyYaml(json, { base: doc });

    expect(output).toContain("name: Sample");
    expect(output).not.toContain("\r\n");
  });
});

