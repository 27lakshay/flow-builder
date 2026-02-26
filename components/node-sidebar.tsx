"use client";

import { useCallback, useState, useEffect } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";
import { generateEdgeId } from "@/lib/flow-types";
import { cn } from "@/lib/utils";

export type NodeSidebarProps = {
  selectedNodeId: string | null;
  onSelectedNodeIdChange?: (id: string | null) => void;
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNodeType[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FlowEdgeType[]>>;
};

export function NodeSidebar({
  selectedNodeId,
  onSelectedNodeIdChange,
  nodes,
  edges,
  setNodes,
  setEdges,
}: NodeSidebarProps) {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const outgoingEdges = edges.filter((e) => e.source === selectedNodeId);
  const [idInput, setIdInput] = useState(selectedNode?.id ?? "");

  useEffect(() => {
    if (selectedNode) setIdInput(selectedNode.id);
  }, [selectedNode?.id]);
  const otherNodes = nodes.filter((n) => n.id !== selectedNodeId);

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<FlowNodeType["data"]>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n
        )
      );
    },
    [setNodes]
  );

  const setAsStart = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isStart: n.id === selectedNodeId },
      }))
    );
  }, [selectedNodeId, setNodes]);

  const updateNodeId = useCallback(
    (newId: string) => {
      if (!selectedNodeId || newId === selectedNodeId) return;
      const trimmed = newId.trim();
      if (!trimmed) return;
      const isDuplicate = nodes.some((n) => n.id === trimmed && n.id !== selectedNodeId);
      if (isDuplicate) return;

      setNodes((nds) =>
        nds.map((n) => (n.id === selectedNodeId ? { ...n, id: trimmed } : n))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          source: e.source === selectedNodeId ? trimmed : e.source,
          target: e.target === selectedNodeId ? trimmed : e.target,
        }))
      );
      onSelectedNodeIdChange?.(trimmed);
    },
    [selectedNodeId, nodes, setNodes, setEdges, onSelectedNodeIdChange]
  );

  const addEdge = useCallback(
    (targetId: string) => {
      if (!selectedNodeId || targetId === selectedNodeId) return;
      const exists = edges.some(
        (e) => e.source === selectedNodeId && e.target === targetId
      );
      if (exists) return;

      const newEdge: FlowEdgeType = {
        id: generateEdgeId(),
        type: "flowEdge",
        source: selectedNodeId,
        target: targetId,
        data: { condition: "" },
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [selectedNodeId, edges, nodes, setEdges]
  );

  const removeEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  const updateEdgeCondition = useCallback(
    (edgeId: string, condition: string) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, data: { ...e.data, condition } } : e
        )
      );
    },
    [setEdges]
  );

  const updateEdgeTarget = useCallback(
    (edgeId: string, newTargetId: string) => {
      if (newTargetId === selectedNodeId) return;
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, target: newTargetId } : e
        )
      );
    },
    [selectedNodeId, setEdges]
  );

  const idDuplicate =
    selectedNode &&
    idInput.trim() &&
    nodes.some((n) => n.id === idInput.trim() && n.id !== selectedNodeId);

  if (!selectedNodeId || !selectedNode) {
    return null;
  }

  return (
    <div className="overflow-y-auto h-full">
      <FieldGroup>
            <Field>
              <FieldLabel htmlFor="node-id">ID (unique)</FieldLabel>
              <Input
                id="node-id"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                onBlur={(e) => updateNodeId(e.target.value)}
                placeholder="node-id"
                className={cn(idDuplicate && "border-destructive")}
              />
              {idDuplicate && (
                <p className="text-destructive text-xs mt-1">
                  Duplicate ID. Choose a unique value.
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="node-name">Name</FieldLabel>
              <Input
                id="node-name"
                value={selectedNode.data?.name ?? ""}
                onChange={(e) =>
                  updateNode(selectedNodeId, { name: e.target.value })
                }
                placeholder="Display name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="node-desc">Description</FieldLabel>
              <Textarea
                id="node-desc"
                value={selectedNode.data?.description ?? ""}
                onChange={(e) =>
                  updateNode(selectedNodeId, { description: e.target.value })
                }
                placeholder="Optional description"
                rows={3}
              />
            </Field>
            <Field>
              <TooltipWrapper content={selectedNode.data?.isStart ? "This is the start node" : "Set this node as the workflow start"}>
                <Button
                  variant={selectedNode.data?.isStart ? "default" : "outline"}
                  size="sm"
                  onClick={setAsStart}
                  className="w-full"
                >
                  {selectedNode.data?.isStart ? "Start Node" : "Set as Start"}
                </Button>
              </TooltipWrapper>
            </Field>
            <Field>
              <FieldLabel>Outgoing Edges</FieldLabel>
              <div className="space-y-2">
                {outgoingEdges.map((edge) => (
                    <div
                      key={edge.id}
                      className="flex gap-2 items-start p-2 rounded-none border bg-background"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <Select
                          value={edge.target}
                          onValueChange={(v) => v && updateEdgeTarget(edge.id, v)}
                          items={otherNodes.map((n) => ({
                            value: n.id,
                            label: n.data?.name || n.id,
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Target" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {otherNodes.map((n) => (
                                <SelectItem key={n.id} value={n.id}>
                                  {n.data?.name || n.id}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Condition"
                          value={edge.data?.condition ?? ""}
                          onChange={(e) =>
                            updateEdgeCondition(edge.id, e.target.value)
                          }
                          className="text-xs"
                        />
                      </div>
                      <TooltipWrapper content="Remove edge">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeEdge(edge.id)}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                        </Button>
                      </TooltipWrapper>
                    </div>
                  ))}
                <DropdownMenu>
                  <TooltipWrapper content="Add edge to another node">
                    <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="w-full" />}>
                      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
                      Add edge
                    </DropdownMenuTrigger>
                  </TooltipWrapper>
                  <DropdownMenuContent>
                    {otherNodes
                      .filter(
                        (n) =>
                          !edges.some(
                            (e) =>
                              e.source === selectedNodeId && e.target === n.id
                          )
                      )
                      .map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          onSelect={() => addEdge(n.id)}
                        >
                          {n.data?.name || n.id}
                        </DropdownMenuItem>
                      ))}
                    {otherNodes.filter(
                      (n) =>
                        !edges.some(
                          (e) =>
                            e.source === selectedNodeId && e.target === n.id
                        )
                    ).length === 0 && (
                      <div className="px-2 py-4 text-muted-foreground text-xs">
                        No more targets
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Field>
          </FieldGroup>
    </div>
  );
}
