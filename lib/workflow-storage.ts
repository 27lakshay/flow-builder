import type { FlowNodeType, FlowEdgeType } from "@/lib/flow-types";

const STORAGE_KEY = "flow-workflows";

export type StoredWorkflow = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  schema: {
    nodes: FlowNodeType[];
    edges: FlowEdgeType[];
  };
};

export type WorkflowStorage = {
  workflows: Record<string, StoredWorkflow>;
  lastActiveWorkflowId: string | null;
};

export function generateWorkflowId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getDefaultTitle(nodes: FlowNodeType[]): string {
  const startNode = nodes.find((n) => n.data?.isStart);
  return startNode?.data?.name || "Untitled";
}

export function loadWorkflowsFromStorage(): WorkflowStorage {
  if (typeof window === "undefined") {
    return { workflows: {}, lastActiveWorkflowId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { workflows: {}, lastActiveWorkflowId: null };
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "workflows" in parsed &&
      typeof (parsed as WorkflowStorage).workflows === "object"
    ) {
      const data = parsed as WorkflowStorage;
      return {
        workflows: data.workflows ?? {},
        lastActiveWorkflowId:
          typeof data.lastActiveWorkflowId === "string"
            ? data.lastActiveWorkflowId
            : null,
      };
    }
  } catch {
    // Invalid JSON or structure
  }
  return { workflows: {}, lastActiveWorkflowId: null };
}

export function saveWorkflowToStorage(
  workflow: StoredWorkflow,
  setAsLastActive: boolean
): void {
  if (typeof window === "undefined") return;
  const data = loadWorkflowsFromStorage();
  data.workflows[workflow.id] = workflow;
  if (setAsLastActive) {
    data.lastActiveWorkflowId = workflow.id;
  }
  const toStore: WorkflowStorage = {
    workflows: data.workflows,
    lastActiveWorkflowId: data.lastActiveWorkflowId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

export function getLastEditedWorkflow(): StoredWorkflow | null {
  const data = loadWorkflowsFromStorage();
  if (!data.lastActiveWorkflowId) return null;
  const workflow = data.workflows[data.lastActiveWorkflowId];
  return workflow ?? null;
}

export function deleteWorkflowFromStorage(workflowId: string): void {
  if (typeof window === "undefined") return;
  const data = loadWorkflowsFromStorage();
  delete data.workflows[workflowId];
  if (data.lastActiveWorkflowId === workflowId) {
    data.lastActiveWorkflowId =
      Object.keys(data.workflows)[0] ?? null;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      workflows: data.workflows,
      lastActiveWorkflowId: data.lastActiveWorkflowId,
    })
  );
}

export function createStoredWorkflow(
  nodes: FlowNodeType[],
  edges: FlowEdgeType[],
  existing?: StoredWorkflow | null,
  titleOverride?: string
): StoredWorkflow {
  const now = Date.now();
  const id = existing?.id ?? generateWorkflowId();
  const title = titleOverride ?? existing?.title ?? getDefaultTitle(nodes);
  const createdAt = existing?.createdAt ?? now;
  return {
    id,
    title,
    createdAt,
    updatedAt: now,
    schema: { nodes, edges },
  };
}
