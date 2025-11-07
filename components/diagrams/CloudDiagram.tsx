'use client';

import { useDiagramStore } from '@/stores';

export function CloudDiagram() {
  const { cloudInput } = useDiagramStore();

  if (!cloudInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p className="text-sm">Enter cloud architecture syntax to see diagram</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-6">
      <div className="text-center text-gray-500">
        <p className="text-sm">Cloud Architecture Diagram (d3-graphviz)</p>
        <p className="text-xs mt-2">Coming later...</p>
      </div>
    </div>
  );
}
