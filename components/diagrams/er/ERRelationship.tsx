'use client';

import { useThemeStore } from '@/stores';
import type { DBRelationship } from '@/lib/utils/chartdb-wrapper';
import { determineRelationshipType } from '@/lib/utils/chartdb-wrapper';

interface ERRelationshipProps {
  relationship: DBRelationship;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
}

export function ERRelationship({ relationship, fromPos, toPos }: ERRelationshipProps) {
  const { getCurrentColors } = useThemeStore();
  const colors = getCurrentColors();

  // Calculate midpoint for label
  const midX = (fromPos.x + toPos.x) / 2;
  const midY = (fromPos.y + toPos.y) / 2;

  // Get relationship type from ChartDB's cardinality system
  const relationshipType = determineRelationshipType({
    sourceCardinality: relationship.sourceCardinality,
    targetCardinality: relationship.targetCardinality,
  });
  const typeLabel = relationshipType.replace(/_/g, '-');

  return (
    <g>
      {/* Relationship line */}
      <line
        x1={fromPos.x}
        y1={fromPos.y}
        x2={toPos.x}
        y2={toPos.y}
        stroke={colors.secondary}
        strokeWidth={2}
        strokeDasharray={relationshipType === 'one_to_one' ? '5,5' : 'none'}
      />

      {/* Arrow at the end */}
      <polygon
        points={`${toPos.x},${toPos.y} ${toPos.x - 8},${toPos.y - 4} ${toPos.x - 8},${toPos.y + 4}`}
        fill={colors.secondary}
      />

      {/* Relationship type label */}
      <text
        x={midX}
        y={midY - 5}
        fill={colors.text}
        fontSize="10"
        fontFamily="monospace"
        textAnchor="middle"
        className="pointer-events-none"
      >
        {typeLabel}
      </text>
    </g>
  );
}
