/**
 * Relationship Edge Component for React Flow
 * Inspired by ChartDB's relationship-edge but simplified
 */

import React, { memo } from 'react';
import type { Edge, EdgeProps } from '@xyflow/react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { DBRelationship } from '@/lib/utils/chartdb-wrapper';
import { determineRelationshipType } from '@/lib/utils/chartdb-wrapper';

export type RelationshipEdgeType = Edge<
  {
    relationship: DBRelationship;
  },
  'relationship-edge'
>;

export const RelationshipEdge: React.FC<EdgeProps<RelationshipEdgeType>> = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
  }) => {
    const relationship = data?.relationship;

    if (!relationship) {
      return null;
    }

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Determine relationship type from cardinality
    const relationshipType = determineRelationshipType({
      sourceCardinality: relationship.sourceCardinality,
      targetCardinality: relationship.targetCardinality,
    });

    // Get color based on relationship type
    const getEdgeColor = () => {
      if (selected) return '#3b82f6'; // blue when selected

      switch (relationshipType) {
        case 'one_to_one':
          return '#10b981'; // green
        case 'one_to_many':
          return '#8b5cf6'; // purple
        case 'many_to_one':
          return '#f59e0b'; // amber
        case 'many_to_many':
          return '#ef4444'; // red
        default:
          return '#64748b'; // slate
      }
    };

    const edgeColor = getEdgeColor();

    // Get label text
    const getLabel = () => {
      switch (relationshipType) {
        case 'one_to_one':
          return '1:1';
        case 'one_to_many':
          return '1:N';
        case 'many_to_one':
          return 'N:1';
        case 'many_to_many':
          return 'N:N';
        default:
          return '';
      }
    };

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: edgeColor,
            strokeWidth: selected ? 3 : 2,
          }}
        />

        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="px-2 py-1 rounded shadow-sm font-mono text-xs font-semibold"
              style={{
                backgroundColor: 'white',
                border: `2px solid ${edgeColor}`,
                color: edgeColor,
              }}
            >
              {getLabel()}
              {relationship.name && (
                <div className="text-xs text-gray-600 font-normal mt-0.5">
                  {relationship.name}
                </div>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }
);

RelationshipEdge.displayName = 'RelationshipEdge';
