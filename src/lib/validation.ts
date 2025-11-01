import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

import schema from "../../public/schema/config.schema.json" assert { type: "json" };
import type { Config } from "@/schema";

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  strict: false
});

addFormats(ajv);

const validate = ajv.compile<Config>(schema);

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ErrorObject[] | null | undefined;
}

export function validateConfig(value: unknown): ValidationResult {
  const isValid = validate(value);
  return {
    valid: Boolean(isValid),
    errors: validate.errors ?? undefined
  };
}
