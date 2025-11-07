'use client';

import { useDiagramStore, useHistoryStore, useThemeStore } from '@/stores';
import { Undo2, Redo2, Palette } from 'lucide-react';

export function Toolbar() {
  const { canUndo, canRedo, undo, redo } = useHistoryStore();
  const { mode, setThemeMode } = useThemeStore();
  const {
    setSequenceInput,
    setErInput,
    setCloudInput,
    setDiagramType,
  } = useDiagramStore();

  const restoreHistoryEntry = (entry: { diagramType: string; input: string }) => {
    // Switch to the correct diagram type
    setDiagramType(entry.diagramType as 'sequence' | 'er' | 'cloud');

    // Restore the input for that diagram type
    switch (entry.diagramType) {
      case 'sequence':
        setSequenceInput(entry.input);
        break;
      case 'er':
        setErInput(entry.input);
        break;
      case 'cloud':
        setCloudInput(entry.input);
        break;
    }
  };

  const handleUndo = () => {
    const entry = undo();
    if (entry) {
      restoreHistoryEntry(entry);
    }
  };

  const handleRedo = () => {
    const entry = redo();
    if (entry) {
      restoreHistoryEntry(entry);
    }
  };

  const toggleTheme = () => {
    setThemeMode(mode === 'default' ? 'brand' : 'default');
  };

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-gray-50 border-b border-gray-200">
      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className={`
          flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded
          ${
            canUndo()
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }
        `}
        title="Undo"
      >
        <Undo2 size={16} />
        Undo
      </button>

      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className={`
          flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded
          ${
            canRedo()
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          }
        `}
        title="Redo"
      >
        <Redo2 size={16} />
        Redo
      </button>

      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
        title="Toggle theme"
      >
        <Palette size={16} />
        {mode === 'default' ? 'Default Theme' : 'Brand Theme'}
      </button>
    </div>
  );
}
