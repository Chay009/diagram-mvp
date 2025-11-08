'use client';

import { useEffect } from 'react';
import { useDiagramStore, useERDiagramStore } from '@/stores';
import { parseDBML } from '@/lib/utils';
import { ERTable } from './er/ERTable';
import { ERRelationship } from './er/ERRelationship';

export function ERDiagram() {
  const { erInput, setErError } = useDiagramStore();
  const {
    dbmlDiagram,
    setDBMLDiagram,
    clearSchema,
    tablePositions,
    selectedTableId,
    selectTable,
    zoom,
    panX,
    panY,
    getTablePosition,
  } = useERDiagramStore();

  // Parse DBML input and update diagram
  useEffect(() => {
    if (!erInput.trim()) {
      clearSchema();
      setErError(null);
      return;
    }

    try {
      const parsed = parseDBML(erInput);
      setDBMLDiagram(parsed);
      setErError(null);
    } catch (error) {
      setErError(error instanceof Error ? error.message : 'Failed to parse DBML');
      clearSchema();
    }
  }, [erInput, setDBMLDiagram, clearSchema, setErError]);

  if (!erInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm mb-2">Enter DBML (Database Markup Language) to see ER diagram</p>
          <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 font-mono max-w-md">
            <div className="font-semibold mb-2 text-gray-700">Example DBML:</div>
            <div className="text-gray-600">
              Table users {'{'}<br />
              &nbsp;&nbsp;id integer [pk]<br />
              &nbsp;&nbsp;name varchar<br />
              {'}'}<br />
              <br />
              Ref: posts.user_id &gt; users.id
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dbmlDiagram) {
    return null;
  }

  // Calculate canvas size based on table positions
  const canvasWidth = Math.max(1200, ...tablePositions.map((p) => p.x + 400));
  const canvasHeight = Math.max(800, ...tablePositions.map((p) => p.y + 400));

  return (
    <div className="w-full h-full overflow-auto relative bg-gray-50">
      <div
        className="relative"
        style={{
          width: `${canvasWidth * zoom}px`,
          height: `${canvasHeight * zoom}px`,
          transform: `translate(${panX}px, ${panY}px)`,
        }}
      >
        {/* SVG for relationships */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
        >
          {dbmlDiagram.relationships.map((relationship, index) => {
            const fromPos = getTablePosition(relationship.from.table);
            const toPos = getTablePosition(relationship.to.table);

            if (!fromPos || !toPos) return null;

            // Calculate connection points (center of tables)
            const fromX = fromPos.x + 100;
            const fromY = fromPos.y + 50;
            const toX = toPos.x + 100;
            const toY = toPos.y + 50;

            return (
              <ERRelationship
                key={index}
                relationship={relationship}
                fromPos={{ x: fromX, y: fromY }}
                toPos={{ x: toX, y: toY }}
              />
            );
          })}
        </svg>

        {/* Tables */}
        {dbmlDiagram.tables.map((table) => {
          const position = getTablePosition(table.name);
          if (!position) return null;

          return (
            <ERTable
              key={table.name}
              table={table}
              position={position}
              isSelected={selectedTableId === table.name}
              onSelect={() => selectTable(table.name)}
            />
          );
        })}
      </div>
    </div>
  );
}
