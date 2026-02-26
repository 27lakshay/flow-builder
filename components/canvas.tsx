"use client";

import {
  ReactFlow,
  Handle,
  Position,
  Background,
  Panel,
  addEdge,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  type NodeProps,
  type EdgeProps,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";
import { generateNodeId, generateEdgeId } from "@/lib/flow-types";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { FlowControls } from "@/components/flow-controls";

const handleClass = "w-2! h-2! border-2! bg-background!";

function FlowNode({ data, selected }: NodeProps<FlowNodeType>) {
  return (
    <div
      className={cn(
        "rounded-none border bg-card px-4 py-3 min-w-[140px] shadow-sm",
        "ring-foreground/10 ring-1",
        selected && "ring-green-500 ring-2 border-green-500",
        data.isStart && "border-primary border-2"
      )}
    >
      {data.isStart && (
        <span className="text-primary text-[10px] font-semibold uppercase tracking-wider block mb-1">
          Start
        </span>
      )}
      <div className="text-sm font-medium">{data.name || "Unnamed"}</div>
      <Handle type="target" position={Position.Top} id="top-target" className={`-top-1! ${handleClass}`} />
      <Handle type="source" position={Position.Top} id="top-source" className={`-top-1! ${handleClass}`} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className={`-bottom-1! ${handleClass}`} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className={`-bottom-1! ${handleClass}`} />
      <Handle type="target" position={Position.Left} id="left-target" className={`-left-1! ${handleClass}`} />
      <Handle type="source" position={Position.Left} id="left-source" className={`-left-1! ${handleClass}`} />
      <Handle type="target" position={Position.Right} id="right-target" className={`-right-1! ${handleClass}`} />
      <Handle type="source" position={Position.Right} id="right-source" className={`-right-1! ${handleClass}`} />
    </div>
  );
}

function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<FlowEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const condition = data?.condition ?? "";

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {condition && (
            <div className="bg-muted text-muted-foreground px-2 py-0.5 rounded-none text-[10px] font-medium border border-border">
              {condition}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { flowNode: FlowNode };
const edgeTypes = { flowEdge: FlowEdge };

export type FlowCanvasProps = {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  nodes: FlowNodeType[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNodeType[]>>;
  edges: FlowEdgeType[];
  setEdges: React.Dispatch<React.SetStateAction<FlowEdgeType[]>>;
  fitViewTrigger?: number;
};

const fitViewOptions = { padding: 0.2, duration: 200 };

export function FlowCanvas({
  selectedNodeId,
  onNodeSelect,
  nodes,
  setNodes,
  edges,
  setEdges,
  fitViewTrigger = 0,
}: FlowCanvasProps) {
  const { resolvedTheme } = useTheme();
  const reactFlow = useReactFlow<FlowNodeType, FlowEdgeType>();
  const colorMode =
    resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : "system";

  useEffect(() => {
    if (fitViewTrigger <= 0 || nodes.length === 0) return;
    const id = requestAnimationFrame(() => {
      reactFlow.fitView(fitViewOptions);
    });
    return () => cancelAnimationFrame(id);
  }, [fitViewTrigger, reactFlow]);

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNodeType>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<FlowEdgeType>[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "flowEdge",
            data: { condition: "" },
            id: generateEdgeId(),
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNodeType) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  const onAddNode = useCallback(() => {
    const newNode: FlowNodeType = {
      id: generateNodeId(),
      type: "flowNode",
      position: { x: 100 + nodes.length * 50, y: 200 + nodes.length * 50 },
      data: { name: "New Node", description: "", isStart: false },
    };
    setNodes((nds) => [...nds, newNode]);
    onNodeSelect(newNode.id);
  }, [nodes.length, setNodes, onNodeSelect]);

  return (
    <div className="absolute inset-0 w-full h-full min-w-0 min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "flowEdge", data: { condition: "" } }}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        colorMode={colorMode}
        className="bg-muted/30"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Panel position="bottom-center">
          <TooltipWrapper content="Add a new node to the flow">
            <Button size="sm" onClick={onAddNode}>
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
              Add Node
            </Button>
          </TooltipWrapper>
        </Panel>
        <FlowControls />
      </ReactFlow>
    </div>
  );
}
