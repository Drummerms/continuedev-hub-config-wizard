import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { zodToJsonSchema } from "zod-to-json-schema";

import { ConfigSchema } from "../src/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(): Promise<void> {
  const targetDir = join(__dirname, "../public/schema");
  await mkdir(targetDir, { recursive: true });

  const jsonSchema = zodToJsonSchema(ConfigSchema, {
    name: "ContinueDevHubConfig"
  });

  await writeFile(
    join(targetDir, "config.schema.json"),
    JSON.stringify(jsonSchema, null, 2),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.info("Generated JSON schema → public/schema/config.schema.json");
}

void main();

