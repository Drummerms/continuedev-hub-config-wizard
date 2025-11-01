import { describe, expect, it } from "vitest";

import { validateConfig } from "@/lib/validation";

describe("validateConfig", () => {
  it("returns valid for schema conforming config", () => {
    const { valid, errors } = validateConfig({
      name: "Valid",
      version: "0.0.1",
      schema: "v1",
      context: [{ provider: "file" }]
    });

    expect(valid).toBe(true);
    expect(errors ?? []).toHaveLength(0);
  });

  it("returns errors for invalid payload", () => {
    const { valid, errors } = validateConfig({
      name: "",
      version: "0.0.1",
      schema: "v1",
      data: [
        {
          name: "bad",
          destination: "ftp://invalid",
          schema: "0.2.0"
        }
      ]
    });

    expect(valid).toBe(false);
    expect(errors?.[0]?.message).toBeDefined();
  });
});

