'use client';

import { useEffect } from 'react';
import { useDiagramStore, useERDiagramStore } from '@/stores';
import { importDBML } from '@/lib/utils';
import { ERDiagramCanvas } from './canvas/ERDiagramCanvas';

export function ERDiagram() {
  const { erInput, setErError } = useDiagramStore();
  const {
    diagram,
    setDiagram,
    clearSchema,
  } = useERDiagramStore();

  // Parse DBML input using ChartDB's actual importDBML function
  useEffect(() => {
    if (!erInput.trim()) {
      clearSchema();
      setErError(null);
      return;
    }

    // importDBML is async, so we need to handle it properly
    const parseDBML = async () => {
      try {
        const parsed = await importDBML(erInput);
        setDiagram(parsed);
        setErError(null);
      } catch (error) {
        setErError(error instanceof Error ? error.message : 'Failed to parse DBML');
        clearSchema();
      }
    };

    parseDBML();
  }, [erInput, setDiagram, clearSchema, setErError]);

  if (!erInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm mb-2">Enter DBML (Database Markup Language) to see ER diagram</p>
          <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 font-mono max-w-md">
            <div className="font-semibold mb-2 text-gray-700">Example DBML:</div>
            <div className="text-gray-600">
              Table users {'{'}<br />
              &nbsp;&nbsp;id integer [pk]<br />
              &nbsp;&nbsp;name varchar<br />
              {'}'}<br />
              <br />
              Ref: posts.user_id &gt; users.id
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!diagram) {
    return null;
  }

  // Use React Flow canvas for rendering
  return <ERDiagramCanvas diagram={diagram} />;
}
