"use client";

import Editor from "@monaco-editor/react";
import { memo } from "react";

export interface YamlPreviewProps {
  readonly value: string;
  readonly ariaLabel?: string;
  readonly readOnly?: boolean;
  readonly onChange?: (value: string) => void;
}

export const YamlPreview = memo(function YamlPreview({
  value,
  ariaLabel,
  readOnly = true,
  onChange
}: YamlPreviewProps): JSX.Element {
  return (
    <div className="flex min-h-[320px] flex-1 overflow-hidden rounded-lg border border-border bg-background">
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        onChange={(nextValue) => onChange?.(nextValue ?? "")}
        options={{
          readOnly,
          automaticLayout: true,
          fontSize: 13,
          minimap: { enabled: false },
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          renderLineHighlight: "none"
        }}
        theme="vs-dark"
        aria-label={ariaLabel}
      />
    </div>
  );
});

