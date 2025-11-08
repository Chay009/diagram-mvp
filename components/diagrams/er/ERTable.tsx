'use client';

import type { DBTable } from '@/lib/utils/chartdb-integration';
import { useThemeStore } from '@/stores';
import { Key, Link2 } from 'lucide-react';

interface ERTableProps {
  table: DBTable;
  position: { x: number; y: number };
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ERTable({ table, position, isSelected, onSelect }: ERTableProps) {
  const { getCurrentColors } = useThemeStore();
  const colors = getCurrentColors();

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(0, 0)',
      }}
      onClick={onSelect}
    >
      <div
        className={`
          bg-white rounded-lg shadow-md overflow-hidden min-w-[200px]
          transition-all cursor-pointer
          ${isSelected ? 'ring-2 ring-offset-2' : 'hover:shadow-lg'}
        `}
        style={{
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? '2px' : '1px',
          borderStyle: 'solid',
        }}
      >
        {/* Table Header */}
        <div
          className="px-4 py-2 font-semibold text-white"
          style={{
            backgroundColor: table.color || colors.primary,
          }}
        >
          {table.name}
          {table.schema && <span className="text-xs opacity-75 ml-2">({table.schema})</span>}
        </div>

        {/* Fields */}
        <div className="divide-y" style={{ borderColor: colors.border }}>
          {table.fields.map((field) => (
            <div
              key={field.id}
              className="px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-50"
            >
              {/* Icons */}
              <div className="flex gap-1">
                {field.primaryKey && (
                  <Key size={14} className="text-yellow-500" />
                )}
                {field.unique && (
                  <Link2 size={14} className="text-purple-500" />
                )}
              </div>

              {/* Field Name */}
              <span className="font-medium flex-1">{field.name}</span>

              {/* Field Type */}
              <span className="text-gray-500 text-xs">{field.type.name}</span>

              {/* Not null indicator */}
              {!field.nullable && (
                <span className="text-xs text-gray-400">
                  *
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
