'use client';

import { useDiagramStore } from '@/stores';
import { useEffect, useRef } from 'react';

export function CodeEditor() {
  const { getCurrentInput, setCurrentInput, currentDiagramType } = useDiagramStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const input = getCurrentInput();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInput(e.target.value);
  };

  useEffect(() => {
    // Focus textarea when diagram type changes
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentDiagramType]);

  const getPlaceholder = () => {
    switch (currentDiagramType) {
      case 'sequence':
        return 'Enter Mermaid sequence diagram syntax...';
      case 'er':
        return 'Enter SQL schema or JSON...';
      case 'cloud':
        return 'Enter cloud architecture syntax...';
      default:
        return 'Enter diagram code...';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Input</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            onClick={() => setCurrentInput('')}
          >
            Clear
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        placeholder={getPlaceholder()}
        className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white"
        spellCheck={false}
      />
    </div>
  );
}
