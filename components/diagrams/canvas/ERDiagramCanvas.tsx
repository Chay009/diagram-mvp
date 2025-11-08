/**
 * ER Diagram Canvas using React Flow
 * Inspired by ChartDB's canvas component but simplified for our use case
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TableNode, type TableNodeType } from './table-node/TableNode';
import { RelationshipEdge, type RelationshipEdgeType } from './relationship-edge/RelationshipEdge';
import type { Diagram } from '@/lib/utils/chartdb-wrapper';
import { useERDiagramStore } from '@/stores';

// Define node and edge types
const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  'relationship-edge': RelationshipEdge,
};

interface ERDiagramCanvasProps {
  diagram: Diagram;
}

export function ERDiagramCanvas({ diagram }: ERDiagramCanvasProps) {
  const { selectedTableId, selectTable, setTablePosition } = useERDiagramStore();

  // Convert diagram tables to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!diagram.tables) return [];

    return diagram.tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: { x: table.x, y: table.y },
      data: {
        table,
        isSelected: selectedTableId === table.id,
      },
    }));
  }, [diagram.tables, selectedTableId]);

  // Convert diagram relationships to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!diagram.relationships) return [];

    return diagram.relationships.map((relationship) => ({
      id: relationship.id,
      type: 'relationship-edge',
      source: relationship.sourceTableId,
      target: relationship.targetTableId,
      sourceHandle: relationship.sourceFieldId
        ? `${relationship.sourceFieldId}-left`  // Source handles are on the LEFT
        : `${relationship.sourceTableId}-top`,
      targetHandle: relationship.targetFieldId
        ? `${relationship.targetFieldId}-right` // Target handles are on the RIGHT
        : `${relationship.targetTableId}-bottom`,
      data: {
        relationship,
      },
    }));
  }, [diagram.relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectTable(node.id);
    },
    [selectTable]
  );

  // Handle node drag end to update positions
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setTablePosition(node.id, node.position.x, node.position.y);
    },
    [setTablePosition]
  );

  // Handle new connections (if we want to allow creating relationships via UI later)
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Update nodes when diagram or selection changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when diagram changes
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: false,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const tableNode = node as TableNodeType;
            return tableNode.data.table.color || '#64748b';
          }}
          maskColor="rgb(240, 240, 240, 0.6)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
