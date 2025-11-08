/**
 * Table Node Component for React Flow
 * Inspired by ChartDB's table-node but simplified for our use case
 */

import React, { memo, useState } from 'react';
import type { NodeProps, Node } from '@xyflow/react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import type { DBTable } from '@/lib/utils/chartdb-wrapper';
import { ChevronDown, ChevronUp, Table2 } from 'lucide-react';

export type TableNodeType = Node<
  {
    table: DBTable;
    isSelected?: boolean;
  },
  'table'
>;

export const TableNode: React.FC<NodeProps<TableNodeType>> = memo(
  ({ id, data, selected }) => {
    const { table } = data;
    const [expanded, setExpanded] = useState(true);

    const fields = table.fields || [];
    const displayFields = expanded ? fields : fields.slice(0, 3);

    return (
      <div
        className="relative bg-white rounded-lg shadow-lg border-2 transition-all"
        style={{
          borderColor: selected ? '#3b82f6' : table.color || '#64748b',
          minWidth: 200,
          maxWidth: 400,
        }}
      >
        <NodeResizer
          minWidth={200}
          minHeight={100}
          isVisible={selected}
          lineClassName="border-blue-400"
          handleClassName="h-3 w-3 bg-white border-2 border-blue-400"
        />

        {/* Table Header */}
        <div
          className="px-3 py-2 rounded-t-md flex items-center justify-between"
          style={{ backgroundColor: table.color || '#64748b' }}
        >
          <div className="flex items-center gap-2 text-white">
            <Table2 className="h-4 w-4" />
            <span className="font-semibold text-sm">{table.name}</span>
            {table.schema && (
              <span className="text-xs opacity-75">({table.schema})</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white hover:bg-white/20 rounded p-1"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Table Fields */}
        <div className="p-2">
          {displayFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center justify-between py-1.5 px-2 text-sm hover:bg-gray-50 rounded relative"
            >
              {/* Left handle for relationships */}
              <Handle
                type="source"
                position={Position.Left}
                id={`${field.id}-left`}
                className="w-2 h-2 !bg-blue-500 !border-2 !border-white"
                style={{ left: -6 }}
              />

              <div className="flex-1 flex items-center gap-2">
                <span className="font-mono text-xs font-medium">
                  {field.name}
                </span>
                {field.primaryKey && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                    PK
                  </span>
                )}
                {field.unique && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    UQ
                  </span>
                )}
                {!field.nullable && (
                  <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                    NN
                  </span>
                )}
              </div>

              <span className="text-xs text-gray-500 ml-2">
                {field.type.name}
              </span>

              {/* Right handle for relationships */}
              <Handle
                type="target"
                position={Position.Right}
                id={`${field.id}-right`}
                className="w-2 h-2 !bg-green-500 !border-2 !border-white"
                style={{ right: -6 }}
              />
            </div>
          ))}

          {!expanded && fields.length > 3 && (
            <div className="text-xs text-gray-400 text-center py-1">
              +{fields.length - 3} more fields
            </div>
          )}
        </div>

        {/* Top/Bottom handles for table-level connections */}
        <Handle
          type="source"
          position={Position.Top}
          id={`${table.id}-top`}
          className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
          style={{ top: -6 }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id={`${table.id}-bottom`}
          className="w-3 h-3 !bg-green-500 !border-2 !border-white"
          style={{ bottom: -6 }}
        />
      </div>
    );
  }
);

TableNode.displayName = 'TableNode';
