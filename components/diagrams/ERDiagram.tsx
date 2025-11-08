'use client';

import { useEffect } from 'react';
import { useDiagramStore, useERDiagramStore } from '@/stores';
import { parseDatabase } from '@/lib/utils';
import { ERTable } from './er/ERTable';
import { ERRelationship } from './er/ERRelationship';

export function ERDiagram() {
  const { erInput, setErError } = useDiagramStore();
  const {
    diagram,
    setDiagram,
    clearSchema,
    selectedTableId,
    selectTable,
    zoom,
    panX,
    panY,
  } = useERDiagramStore();

  // Parse DBML input and update diagram using ChartDB
  useEffect(() => {
    if (!erInput.trim()) {
      clearSchema();
      setErError(null);
      return;
    }

    try {
      const parsed = parseDatabase(erInput, 'dbml');
      setDiagram(parsed);
      setErError(null);
    } catch (error) {
      setErError(error instanceof Error ? error.message : 'Failed to parse DBML');
      clearSchema();
    }
  }, [erInput, setDiagram, clearSchema, setErError]);

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

  if (!diagram) {
    return null;
  }

  // Calculate canvas size based on table positions (now tables have x, y built-in)
  const canvasWidth = Math.max(1200, ...diagram.tables.map((t) => t.x + 400));
  const canvasHeight = Math.max(800, ...diagram.tables.map((t) => t.y + 400));

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
          {diagram.relationships.map((relationship, index) => {
            // Find source and target tables
            const fromTable = diagram.tables.find(t => t.id === relationship.sourceTableId);
            const toTable = diagram.tables.find(t => t.id === relationship.targetTableId);

            if (!fromTable || !toTable) return null;

            // Calculate connection points (center of tables)
            const fromX = fromTable.x + 100;
            const fromY = fromTable.y + 50;
            const toX = toTable.x + 100;
            const toY = toTable.y + 50;

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
        {diagram.tables.map((table) => {
          return (
            <ERTable
              key={table.id}
              table={table}
              position={{ x: table.x, y: table.y }}
              isSelected={selectedTableId === table.id}
              onSelect={() => selectTable(table.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
