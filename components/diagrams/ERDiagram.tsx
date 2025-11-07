'use client';

import { useDiagramStore } from '@/stores';

export function ERDiagram() {
  const { erInput } = useDiagramStore();

  if (!erInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-sm">Enter SQL schema or JSON to see ER diagram</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-6">
      <div className="text-center text-gray-500">
        <p className="text-sm">ER Diagram rendering (ChartDB integration)</p>
        <p className="text-xs mt-2">Coming next...</p>
      </div>
    </div>
  );
}
