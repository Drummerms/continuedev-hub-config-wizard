import YAML, { type Document, type ParseOptions, type ToJSOptions } from "yaml";

export interface ParsedYaml {
  readonly doc: Document.Parsed;
  readonly json: unknown;
  readonly errors: readonly Error[];
  readonly warnings: readonly YAML.YAMLWarning[];
}

const PARSE_OPTIONS: ParseOptions = {
  keepSourceTokens: true,
  prettyErrors: true
};

const TO_JS_OPTIONS: ToJSOptions = {
  maxAliasCount: -1
};

export function parseYaml(source: string): ParsedYaml {
  const document = YAML.parseDocument(source, PARSE_OPTIONS) as Document.Parsed;

  return {
    doc: document,
    json: document.toJS(TO_JS_OPTIONS),
    errors: document.errors ?? [],
    warnings: document.warnings ?? []
  };
}

export interface StringifyOptions {
  readonly base?: Document.Parsed;
  readonly eol?: "\n" | "\r\n";
}

export function stringifyYaml(value: unknown, options: StringifyOptions = {}): string {
  const { base, eol = "\n" } = options;
  const document: Document =
    base !== undefined
      ? (base.clone() as Document.Parsed)
      : new YAML.Document({
          version: "1.2",
          schema: "core"
        });

  document.contents = document.createNode(value);
  const text = document.toString({
    blockQuote: "literal",
    lineWidth: 0
  });

  return text.replace(/\n/g, eol);
}
