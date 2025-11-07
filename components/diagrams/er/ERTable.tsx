'use client';

import type { Table } from '@/lib/utils/erParser';
import { useThemeStore } from '@/stores';
import { Key, Link } from 'lucide-react';

interface ERTableProps {
  table: Table;
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
            backgroundColor: colors.primary,
          }}
        >
          {table.name}
        </div>

        {/* Columns */}
        <div className="divide-y" style={{ borderColor: colors.border }}>
          {table.columns.map((column, index) => (
            <div
              key={index}
              className="px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-50"
            >
              {/* Icons */}
              <div className="flex gap-1">
                {column.isPrimaryKey && (
                  <Key size={14} className="text-yellow-500" title="Primary Key" />
                )}
                {column.isForeignKey && (
                  <Link size={14} className="text-blue-500" title="Foreign Key" />
                )}
              </div>

              {/* Column Name */}
              <span className="font-medium flex-1">{column.name}</span>

              {/* Column Type */}
              <span className="text-gray-500 text-xs">{column.type}</span>

              {/* Nullable indicator */}
              {!column.nullable && (
                <span className="text-xs text-gray-400" title="NOT NULL">
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
