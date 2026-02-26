"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NodeSidebar } from "@/components/node-sidebar";
import { JsonPreview } from "@/components/json-preview";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";

export type PropertiesPanelProps = {
  selectedNodeId: string | null;
  onSelectedNodeIdChange: (id: string | null) => void;
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FlowEdgeType[]>>;
  workflowTitle: string;
  onWorkflowTitleChange: (title: string) => void;
  workflowId: string | null;
};

export function PropertiesPanel({
  selectedNodeId,
  onSelectedNodeIdChange,
  nodes,
  edges,
  setNodes,
  setEdges,
  workflowTitle,
  onWorkflowTitleChange,
  workflowId,
}: PropertiesPanelProps) {
  return (
    <div className="flex h-full flex-col border-l bg-background">
      <Tabs defaultValue="properties" className="flex flex-1 flex-col min-h-0">
        <TabsList variant="line" className="w-full justify-start rounded-none border-b px-4 h-9">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="flex-1 min-h-0 overflow-hidden mt-0 p-4">
          <div className="space-y-4">
            {selectedNodeId ? (
              <NodeSidebar
                selectedNodeId={selectedNodeId}
                onSelectedNodeIdChange={onSelectedNodeIdChange}
                nodes={nodes}
                edges={edges}
                setNodes={setNodes}
                setEdges={setEdges}
              />
            ) : (
              <FieldGroup>
                <Field>
                  <FieldLabel>Workflow Name</FieldLabel>
                  <Input
                    value={workflowTitle}
                    onChange={(e) => onWorkflowTitleChange(e.target.value)}
                    placeholder="Untitled"
                  />
                </Field>
                <Field>
                  <FieldLabel>Workflow ID</FieldLabel>
                  <Input
                    value={workflowId ?? "—"}
                    readOnly
                    className="bg-muted/50 font-mono text-xs"
                  />
                </Field>
              </FieldGroup>
            )}
          </div>
        </TabsContent>

        <TabsContent value="json" className="flex-1 min-h-0 overflow-hidden mt-0 p-4">
          <div className="h-full min-h-0 flex flex-col">
            <JsonPreview nodes={nodes} edges={edges} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
