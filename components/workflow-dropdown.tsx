"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { loadWorkflowsFromStorage } from "@/lib/workflow-storage";
import type { StoredWorkflow } from "@/lib/workflow-storage";

export type WorkflowDropdownProps = {
  workflowTitle: string;
  onLoadWorkflow: (workflow: StoredWorkflow) => void;
  onDeleteWorkflow: (id: string, e?: React.SyntheticEvent) => void;
  workflowsListKey: number;
};

export function WorkflowDropdown({
  workflowTitle,
  onLoadWorkflow,
  onDeleteWorkflow,
  workflowsListKey,
}: WorkflowDropdownProps) {
  const workflows = useMemo(() => {
    const data = loadWorkflowsFromStorage();
    return Object.values(data.workflows).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  }, [workflowsListKey]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-sm font-normal" />
        }
      >
        <span className="text-muted-foreground">◆</span>
        <span>{workflowTitle}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {workflows.length === 0 ? (
          <div className="px-2 py-4 text-muted-foreground text-xs">
            No workflows saved
          </div>
        ) : (
          workflows.map((wf) => (
            <DropdownMenuItem
              key={wf.id}
              onClick={() => onLoadWorkflow(wf)}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <span className="min-w-0 flex-1 truncate">{wf.title || "Untitled"}</span>
              <span
                role="button"
                tabIndex={0}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => onDeleteWorkflow(wf.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onDeleteWorkflow(wf.id, e);
                  }
                }}
              >
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-3.5" />
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
