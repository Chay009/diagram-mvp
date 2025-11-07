'use client';

import { useDiagramStore, useThemeStore } from '@/stores';
import { SequenceDiagram } from './diagrams/SequenceDiagram';
import { ERDiagram } from './diagrams/ERDiagram';
import { CloudDiagram } from './diagrams/CloudDiagram';

export function DiagramPreview() {
  const { currentDiagramType, sequenceError, erError, cloudError } = useDiagramStore();
  const { mode } = useThemeStore();

  const renderDiagram = () => {
    switch (currentDiagramType) {
      case 'sequence':
        return <SequenceDiagram />;
      case 'er':
        return <ERDiagram />;
      case 'cloud':
        return <CloudDiagram />;
      default:
        return null;
    }
  };

  const getCurrentError = () => {
    switch (currentDiagramType) {
      case 'sequence':
        return sequenceError;
      case 'er':
        return erError;
      case 'cloud':
        return cloudError;
      default:
        return null;
    }
  };

  const error = getCurrentError();

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

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-semibold text-xs">Error:</span>
            <p className="text-xs text-red-700 flex-1">{error}</p>
          </div>
        </div>
      )}

      {/* Diagram Rendering Area */}
      <div className="flex-1 overflow-auto bg-white">
        {renderDiagram()}
      </div>
    </div>
  );
}
