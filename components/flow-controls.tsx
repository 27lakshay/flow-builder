"use client";

import { Panel, useReactFlow, useStore, useStoreApi } from "@xyflow/react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
  FitToScreenIcon,
  LockIcon,
  SquareUnlock01Icon,
} from "@hugeicons/core-free-icons";
import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";

const fitViewOptions = { padding: 0.2, duration: 200 };

const isInteractiveSelector = (s: { nodesDraggable: boolean; elementsSelectable: boolean; nodesConnectable: boolean }) =>
  s.nodesDraggable && s.elementsSelectable && s.nodesConnectable;

export function FlowControls() {
  const reactFlow = useReactFlow<FlowNodeType, FlowEdgeType>();
  const store = useStoreApi<FlowNodeType, FlowEdgeType>();
  const isInteractive = useStore(isInteractiveSelector);

  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn({ duration: 200 });
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut({ duration: 200 });
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    reactFlow.fitView(fitViewOptions);
  }, [reactFlow]);

  const handleToggleLock = useCallback(() => {
    store.setState({
      nodesDraggable: !isInteractive,
      elementsSelectable: !isInteractive,
      nodesConnectable: !isInteractive,
    });
  }, [store, isInteractive]);

  return (
    <Panel
      position="bottom-right"
      className="flex flex-col gap-0.5 rounded-none border border-border bg-background/95 shadow-sm p-1 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <TooltipWrapper content="Zoom in">
        <Button variant="outline" size="icon-sm" onClick={handleZoomIn} className="nodrag nopan">
          <HugeiconsIcon icon={ZoomInAreaIcon} strokeWidth={2} className="size-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper content="Zoom out">
        <Button variant="outline" size="icon-sm" onClick={handleZoomOut} className="nodrag nopan">
          <HugeiconsIcon icon={ZoomOutAreaIcon} strokeWidth={2} className="size-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper content="Fit view">
        <Button variant="outline" size="icon-sm" onClick={handleFitView} className="nodrag nopan">
          <HugeiconsIcon icon={FitToScreenIcon} strokeWidth={2} className="size-4" />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper content={isInteractive ? "Lock viewport" : "Unlock viewport"}>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleToggleLock}
          className="nodrag nopan"
          data-state={isInteractive ? "unlocked" : "locked"}
        >
          <HugeiconsIcon
            icon={isInteractive ? LockIcon : SquareUnlock01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </TooltipWrapper>
    </Panel>
  );
}
