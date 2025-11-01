import { describe, expect, it } from "vitest";

import { ConfigSchema } from "@/schema";

describe("ConfigSchema", () => {
  it("accepts a minimal configuration", () => {
    const result = ConfigSchema.safeParse({
      name: "Minimal",
      version: "0.0.1",
      schema: "v1"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        name: "Minimal",
        schema: "v1"
      });
    }
  });

  it("rejects data destinations without supported protocols", () => {
    const result = ConfigSchema.safeParse({
      name: "Bad Destination",
      version: "0.0.1",
      schema: "v1",
      data: [
        {
          name: "Bad",
          destination: "ftp://example.com/results",
          schema: "0.2.0"
        }
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("destination must be file:///... or http(s)://...");
    }
  });
});

