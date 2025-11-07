'use client';

import { DiagramTabs } from './DiagramTabs';
import { CodeEditor } from './CodeEditor';
import { DiagramPreview } from './DiagramPreview';
import { Toolbar } from './Toolbar';

export function DiagramEditor() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with tabs */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Diagram Editor</h1>
        </div>
        <DiagramTabs />
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 border-r border-gray-200">
          <CodeEditor />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2">
          <DiagramPreview />
        </div>
      </div>
    </div>
  );
}
