'use client';

import { DiagramType, useDiagramStore } from '@/stores';

export function DiagramTabs() {
  const { currentDiagramType, setDiagramType } = useDiagramStore();

  const tabs: { id: DiagramType; label: string }[] = [
    { id: 'sequence', label: 'Sequence Diagram' },
    { id: 'er', label: 'ER Diagram' },
    { id: 'cloud', label: 'Cloud Architecture' },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDiagramType(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                currentDiagramType === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
