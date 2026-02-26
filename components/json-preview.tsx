"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { codeToHtml } from "shiki";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";
import { flowToSchema } from "@/lib/flow-types";

export type JsonPreviewProps = {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
};

export type ValidationError = {
  message: string;
};

function validateFlow(
  nodes: FlowNodeType[],
  edges: FlowEdgeType[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(nodes.map((n) => n.id));

  const seenIds = new Set<string>();
  for (const n of nodes) {
    if (!n.id?.trim()) {
      errors.push({ message: "Node has empty ID" });
    } else if (seenIds.has(n.id)) {
      errors.push({ message: `Duplicate node ID: ${n.id}` });
    } else {
      seenIds.add(n.id);
    }
  }

  for (const e of edges) {
    if (!nodeIds.has(e.source)) {
      errors.push({ message: `Edge references missing source node: ${e.source}` });
    }
    if (!nodeIds.has(e.target)) {
      errors.push({ message: `Edge references missing target node: ${e.target}` });
    }
  }

  return errors;
}

export function JsonPreview({ nodes, edges }: JsonPreviewProps) {
  const schema = useMemo(() => flowToSchema(nodes, edges), [nodes, edges]);
  const jsonString = useMemo(
    () => JSON.stringify(schema, null, 2),
    [schema]
  );
  const validationErrors = useMemo(
    () => validateFlow(nodes, edges),
    [nodes, edges]
  );

  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(jsonString, {
      lang: "json",
      theme: "one-dark-pro",
    }).then((html) => {
      if (!cancelled) setHighlightedHtml(html);
    });
    return () => {
      cancelled = true;
    };
  }, [jsonString]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      setCopied(false);
    }
  }, [jsonString]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow-schema.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonString]);

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden gap-2">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          {validationErrors.length > 0 && (
            <div className="space-y-1">
              {validationErrors.map((err, i) => (
                <p
                  key={i}
                  className="text-destructive text-xs font-medium"
                >
                  {err.message}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <TooltipWrapper content={copied ? "Copied!" : "Copy JSON schema"}>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleCopy}
            >
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper content="Download as JSON file">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleDownload}
            >
              <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-none border bg-muted/50">
        <div
          className="json-preview-shiki p-3 px-4 text-[11px] leading-normal font-mono"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          dangerouslySetInnerHTML={{
            __html: highlightedHtml ?? "",
          }}
        />
      </div>
    </div>
  );
}
