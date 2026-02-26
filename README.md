# Flow Builder

A visual workflow builder for designing and managing node-based flow diagrams. Create, edit, and export workflows with an intuitive drag-and-drop canvas, real-time JSON schema preview, and local persistence.

## Description

Flow Builder is a Next.js application that lets you build workflows by connecting nodes on an interactive canvas. Each workflow consists of nodes (steps) and edges (connections) that define the flow logic. Workflows can be saved locally, imported from JSON, and exported for use in other systems.

## Features

### Canvas & Nodes

- **Visual flow canvas** — Interactive canvas powered by React Flow for drag-and-drop workflow design
- **Add nodes** — Create new nodes with a single click via the "Add Node" button
- **Node types** — Support for standard flow nodes with a designated start node
- **Multi-directional connections** — Connect nodes via handles on top, bottom, left, and right
- **Delete nodes** — Remove nodes and edges with Backspace or Delete
- **Fit view** — Automatically fit the entire workflow in view when loading or importing

### Node & Edge Editing

- **Properties panel** — Resizable right sidebar for editing workflow and node properties
- **Node properties** — Edit node ID, name, and description
- **Set start node** — Mark any node as the workflow entry point
- **Outgoing edges** — Add, remove, and configure edges from the properties panel
- **Edge conditions** — Attach optional condition labels to edges
- **Edge targets** — Change edge targets via dropdown selection

### Workflow Management

- **Multiple workflows** — Create and switch between multiple workflows
- **Workflow dropdown** — Quick access to all saved workflows, sorted by last edited
- **Auto-save** — Workflows automatically save to localStorage as you edit
- **New workflow** — Start fresh with confirmation when there are unsaved changes
- **Delete workflows** — Remove workflows from the dropdown
- **Workflow naming** — Edit workflow title; ID is auto-generated and read-only

### Import & Export

- **Import JSON** — Load workflows from a JSON schema file
- **Export JSON** — Download the current workflow as a JSON schema file
- **Schema validation** — Import validates structure (nodes, edges, references) before loading

### JSON Preview

- **Live JSON view** — Real-time syntax-highlighted preview of the workflow schema
- **Validation errors** — Surface issues like duplicate IDs or orphaned edges
- **Copy to clipboard** — Copy the JSON schema with one click
- **Download** — Download the schema directly from the preview

### Canvas Controls

- **Zoom in / Zoom out** — Adjust canvas zoom level
- **Fit view** — Fit all nodes in the viewport
- **Lock viewport** — Lock or unlock the canvas to prevent accidental panning and editing

### UI & Experience

- **Light/dark theme** — Toggle between light and dark mode
- **Responsive layout** — Resizable properties panel with drag handle
- **Tooltips** — Helpful tooltips on buttons and controls

## Tech Stack

- **Next.js 16** — React framework
- **React Flow (@xyflow/react)** — Flow diagram library
- **Shiki** — Syntax highlighting for JSON preview
- **Tailwind CSS** — Styling
- **next-themes** — Theme switching

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
pnpm build
pnpm start
```

## Project Structure

- `app/` — Next.js app router pages and layout
- `components/` — React components (flow-builder, canvas, properties-panel, node-sidebar, etc.)
- `lib/` — Flow types, schema conversion, and workflow storage utilities
