"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useNodesState, useEdgesState } from "@xyflow/react";
import { FlowCanvas } from "@/components/canvas";
import { PropertiesPanel } from "@/components/properties-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileAddIcon,
  FileImportIcon,
  Download01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import { WorkflowDropdown } from "@/components/workflow-dropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";
import { flowToSchema, schemaToFlow, parseAndValidateFlowSchema } from "@/lib/flow-types";
import {
  getLastEditedWorkflow,
  saveWorkflowToStorage,
  createStoredWorkflow,
  loadWorkflowsFromStorage,
  deleteWorkflowFromStorage,
} from "@/lib/workflow-storage";
import type { StoredWorkflow } from "@/lib/workflow-storage";

const initialNodes: FlowNodeType[] = [
  {
    id: "start",
    type: "flowNode",
    position: { x: 250, y: 50 },
    data: { name: "Start", description: "Entry point", isStart: true },
  },
];

const initialEdges: FlowEdgeType[] = [];

const INITIAL_SNAPSHOT = JSON.stringify({ nodes: initialNodes, edges: initialEdges });

const DEFAULT_PANEL_WIDTH = 340;
const MIN_PANEL_WIDTH = 280;

export function FlowBuilder() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState("Untitled");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>(INITIAL_SNAPSHOT);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0);
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [workflowsListKey, setWorkflowsListKey] = useState(0);

  const skipNextSaveRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = panelWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = startX - moveEvent.clientX;
        const maxWidth = Math.min(600, window.innerWidth * 0.5);
        const newWidth = Math.min(
          maxWidth,
          Math.max(MIN_PANEL_WIDTH, startWidth + deltaX)
        );
        setPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [panelWidth]
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setPanelWidth(DEFAULT_PANEL_WIDTH);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const resetToBlank = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setWorkflowId(null);
    setWorkflowTitle("Untitled");
    setSelectedNodeId(null);
    setLastSavedSnapshot(INITIAL_SNAPSHOT);
    setConfirmNewOpen(false);
  }, [setNodes, setEdges]);

  const performSave = useCallback(() => {
    const data = loadWorkflowsFromStorage();
    const existing = workflowId ? data.workflows[workflowId] ?? null : null;
    const workflow = createStoredWorkflow(
      nodes,
      edges,
      existing,
      workflowTitle || "Untitled"
    );
    saveWorkflowToStorage(workflow, true);
    setWorkflowId(workflow.id);
    setWorkflowTitle(workflow.title);
    setLastSavedSnapshot(JSON.stringify({ nodes, edges }));
  }, [nodes, edges, workflowId, workflowTitle]);

  const isDirty = lastSavedSnapshot !== JSON.stringify({ nodes, edges });

  const handleNewClick = useCallback(() => {
    if (!isDirty) {
      resetToBlank();
    } else {
      setConfirmNewOpen(true);
    }
  }, [isDirty, resetToBlank]);

  const handleSaveAndNew = useCallback(() => {
    performSave();
    resetToBlank();
  }, [performSave, resetToBlank]);

  const handleDiscardAndNew = useCallback(() => {
    resetToBlank();
  }, [resetToBlank]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result;
          if (typeof text !== "string") {
            alert("Invalid JSON file");
            return;
          }
          const parsed = JSON.parse(text) as unknown;
          const result = parseAndValidateFlowSchema(parsed);
          if (!result.success) {
            alert(result.error);
            return;
          }
          const { nodes: newNodes, edges: newEdges } = schemaToFlow(result.schema);
          setNodes(newNodes);
          setEdges(newEdges);
          setSelectedNodeId(null);
          if (result.schema.startNodeId) {
            const startNode = result.schema.nodes.find((n) => n.id === result.schema.startNodeId);
            if (startNode?.name) {
              setWorkflowTitle(startNode.name);
            }
          }
          setFitViewTrigger((k) => k + 1);
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges]
  );

  const handleExportClick = useCallback(() => {
    const schema = flowToSchema(nodes, edges);
    const json = JSON.stringify(schema, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${(workflowTitle || "untitled").replace(/[^a-z0-9-_]/gi, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, workflowTitle]);

  const handleLoadWorkflow = useCallback(
    (workflow: StoredWorkflow) => {
      skipNextSaveRef.current = true;
      setNodes(workflow.schema.nodes);
      setEdges(workflow.schema.edges);
      setWorkflowId(workflow.id);
      setWorkflowTitle(workflow.title || "Untitled");
      setLastSavedSnapshot(
        JSON.stringify({ nodes: workflow.schema.nodes, edges: workflow.schema.edges })
      );
      setSelectedNodeId(null);
      setFitViewTrigger((k) => k + 1);
    },
    [setNodes, setEdges]
  );

  const handleDeleteWorkflow = useCallback(
    (idToDelete: string, e?: React.SyntheticEvent) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();
      deleteWorkflowFromStorage(idToDelete);
      setWorkflowsListKey((k) => k + 1);
      if (workflowId === idToDelete) {
        const data = loadWorkflowsFromStorage();
        const next = data.lastActiveWorkflowId
          ? data.workflows[data.lastActiveWorkflowId]
          : null;
        if (next) {
          handleLoadWorkflow(next);
        } else {
          resetToBlank();
        }
      }
    },
    [workflowId, handleLoadWorkflow, resetToBlank]
  );

  useEffect(() => {
    const saved = getLastEditedWorkflow();
    if (saved?.schema && Array.isArray(saved.schema.nodes) && Array.isArray(saved.schema.edges)) {
      const timer = setTimeout(() => {
        setNodes(saved.schema.nodes);
        setEdges(saved.schema.edges);
        setWorkflowId(saved.id);
        setWorkflowTitle(saved.title || "Untitled");
        setLastSavedSnapshot(
          JSON.stringify({ nodes: saved.schema.nodes, edges: saved.schema.edges })
        );
        setFitViewTrigger((k) => k + 1);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      skipNextSaveRef.current = true;
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }
      const snapshot = JSON.stringify({ nodes, edges });
      const data = loadWorkflowsFromStorage();
      const existing = workflowId ? data.workflows[workflowId] ?? null : null;
      const currentTitle = workflowTitle || "Untitled";
      const titleChanged = existing?.title !== currentTitle;
      const schemaChanged = snapshot !== lastSavedSnapshot;

      if (!schemaChanged && !titleChanged) return;

      const workflow = createStoredWorkflow(
        nodes,
        edges,
        existing,
        currentTitle
      );
      saveWorkflowToStorage(workflow, true);
      setWorkflowId(workflow.id);
      setWorkflowTitle(workflow.title);
      setLastSavedSnapshot(snapshot);
    }, 500);

    return () => clearTimeout(timer);
  }, [nodes, edges, lastSavedSnapshot, workflowId, workflowTitle]);

  return (
    <ReactFlowProvider>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        {/* Top bar */}
        <header className="relative flex h-12 shrink-0 items-center border-b bg-background px-4">
          <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
            <WorkflowDropdown
              workflowTitle={workflowTitle}
              onLoadWorkflow={handleLoadWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              workflowsListKey={workflowsListKey}
            />
          </div>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
            <TooltipWrapper content="New workflow">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleNewClick}>
                <HugeiconsIcon icon={FileAddIcon} strokeWidth={2} className="size-4" />
                <span>New</span>
              </Button>
            </TooltipWrapper>
            <TooltipWrapper content="Import JSON schema">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleImportClick}>
                <HugeiconsIcon icon={FileImportIcon} strokeWidth={2} className="size-4" />
                <span>Import</span>
              </Button>
            </TooltipWrapper>
            <TooltipWrapper content="Export JSON schema">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleExportClick}>
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="size-4" />
                <span>Export</span>
              </Button>
            </TooltipWrapper>
            <TooltipWrapper content="Lock">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <HugeiconsIcon icon={LockIcon} strokeWidth={2} className="size-4" />
                <span>Lock</span>
              </Button>
            </TooltipWrapper>
          </div>

          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center">
            <ThemeToggle />
          </div>
        </header>

        {/* Canvas + resizable right panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="relative h-full w-full min-h-0 min-w-0">
              <FlowCanvas
                selectedNodeId={selectedNodeId}
                onNodeSelect={setSelectedNodeId}
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                fitViewTrigger={fitViewTrigger}
              />
            </div>
          </div>

          <div
            onMouseDown={handleResizeStart}
            className="group shrink-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-primary/20 transition-colors"
            role="separator"
            aria-orientation="vertical"
          >
            <div className="w-1 h-full bg-border group-hover:bg-primary/50 transition-colors" />
          </div>

          <div
            style={{ width: `${panelWidth}px` }}
            className="shrink-0 overflow-hidden border-l bg-background transition-[width] duration-300 ease-out"
          >
            <PropertiesPanel
              selectedNodeId={selectedNodeId}
              onSelectedNodeIdChange={setSelectedNodeId}
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              workflowTitle={workflowTitle}
              onWorkflowTitleChange={setWorkflowTitle}
              workflowId={workflowId}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={confirmNewOpen} onOpenChange={setConfirmNewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save the current workflow before
              starting a new one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardAndNew}>
              Discard & start new
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndNew}>
              Save & start new
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ReactFlowProvider>
  );
}
