'use client';

import { useDiagramStore, useThemeStore } from '@/stores';

export function DiagramPreview() {
  const { currentDiagramType } = useDiagramStore();
  const { mode } = useThemeStore();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
        <div className="flex gap-2">
          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            {mode === 'brand' ? 'Brand Theme' : 'Default Theme'}
          </span>
          <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
            Export
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              {currentDiagramType === 'sequence' && 'Sequence diagram preview will appear here'}
              {currentDiagramType === 'er' && 'ER diagram preview will appear here'}
              {currentDiagramType === 'cloud' && 'Cloud architecture preview will appear here'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
