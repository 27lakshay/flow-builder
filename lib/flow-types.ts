import type { Node, Edge } from "@xyflow/react";

export type FlowNodeData = {
  name: string;
  description: string;
  isStart: boolean;
};

export type FlowEdgeData = {
  condition: string;
};

export type FlowNode = {
  id: string;
  name: string;
  description: string;
  isStart: boolean;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  condition: string;
};

export type FlowSchema = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  startNodeId: string | null;
};

export type FlowNodeType = Node<FlowNodeData, "flowNode">;
export type FlowEdgeType = Edge<FlowEdgeData, "flowEdge">;

export function flowToSchema(
  nodes: FlowNodeType[],
  edges: FlowEdgeType[]
): FlowSchema {
  const startNode = nodes.find((n) => n.data?.isStart);
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      name: n.data?.name ?? n.id,
      description: n.data?.description ?? "",
      isStart: n.data?.isStart ?? false,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      condition: e.data?.condition ?? "",
    })),
    startNodeId: startNode?.id ?? null,
  };
}

export function schemaToFlow(schema: FlowSchema): {
  nodes: FlowNodeType[];
  edges: FlowEdgeType[];
} {
  const nodes: FlowNodeType[] = schema.nodes.map((n, i) => ({
    id: n.id,
    type: "flowNode" as const,
    position: { x: 100 + i * 220, y: 100 },
    data: {
      name: n.name,
      description: n.description,
      isStart: n.isStart,
    },
  }));

  const edges: FlowEdgeType[] = schema.edges.map((e) => ({
    id: e.id,
    type: "flowEdge" as const,
    source: e.source,
    target: e.target,
    data: { condition: e.condition },
  }));

  return { nodes, edges };
}

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateEdgeId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type ParseFlowSchemaResult =
  | { success: true; schema: FlowSchema }
  | { success: false; error: string };

export function parseAndValidateFlowSchema(json: unknown): ParseFlowSchemaResult {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return { success: false, error: "Invalid schema: expected an object" };
  }

  const obj = json as Record<string, unknown>;

  if (!Array.isArray(obj.nodes)) {
    return { success: false, error: "Invalid schema: missing or invalid nodes array" };
  }

  if (!Array.isArray(obj.edges)) {
    return { success: false, error: "Invalid schema: missing or invalid edges array" };
  }

  const nodes: FlowNode[] = [];
  for (let i = 0; i < obj.nodes.length; i++) {
    const n = obj.nodes[i];
    if (!n || typeof n !== "object" || Array.isArray(n)) {
      return { success: false, error: `Invalid schema: node at index ${i} is invalid` };
    }
    const node = n as Record<string, unknown>;
    const id = typeof node.id === "string" ? node.id : String(node.id ?? `node_${i}`);
    nodes.push({
      id,
      name: typeof node.name === "string" ? node.name : String(node.name ?? ""),
      description: typeof node.description === "string" ? node.description : String(node.description ?? ""),
      isStart: node.isStart === true,
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: FlowEdge[] = [];
  for (let i = 0; i < obj.edges.length; i++) {
    const e = obj.edges[i];
    if (!e || typeof e !== "object" || Array.isArray(e)) {
      return { success: false, error: `Invalid schema: edge at index ${i} is invalid` };
    }
    const edge = e as Record<string, unknown>;
    const source = String(edge.source ?? "");
    const target = String(edge.target ?? "");
    if (!nodeIds.has(source)) {
      return { success: false, error: `Invalid schema: edge references missing source node: ${source}` };
    }
    if (!nodeIds.has(target)) {
      return { success: false, error: `Invalid schema: edge references missing target node: ${target}` };
    }
    edges.push({
      id: typeof edge.id === "string" ? edge.id : `edge_${i}`,
      source,
      target,
      condition: typeof edge.condition === "string" ? edge.condition : String(edge.condition ?? ""),
    });
  }

  const startNodeId =
    typeof obj.startNodeId === "string" && nodeIds.has(obj.startNodeId)
      ? obj.startNodeId
      : nodes.find((n) => n.isStart)?.id ?? null;

  return {
    success: true,
    schema: { nodes, edges, startNodeId },
  };
}
