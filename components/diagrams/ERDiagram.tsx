'use client';

import { useEffect } from 'react';
import { useDiagramStore, useERDiagramStore } from '@/stores';
import { importSchema } from '@/lib/utils/chartdb-wrapper';
import { ERDiagramCanvas } from './canvas/ERDiagramCanvas';

export function ERDiagram() {
  const { erInput, setErError } = useDiagramStore();
  const {
    diagram,
    setDiagram,
    clearSchema,
  } = useERDiagramStore();

  // Parse DBML or SQL input using auto-detection
  useEffect(() => {
    if (!erInput.trim()) {
      clearSchema();
      setErError(null);
      return;
    }

    // importSchema auto-detects SQL vs DBML
    const parseSchema = async () => {
      try {
        const parsed = await importSchema(erInput);
        setDiagram(parsed);
        setErError(null);
      } catch (error) {
        setErError(error instanceof Error ? error.message : 'Failed to parse schema');
        clearSchema();
      }
    };

    parseSchema();
  }, [erInput, setDiagram, clearSchema, setErError]);

  if (!erInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm mb-2">Enter DBML or SQL DDL to see ER diagram</p>
          <div className="grid grid-cols-2 gap-4 mt-4 max-w-2xl">
            <div className="text-xs text-left bg-gray-100 p-3 rounded font-mono">
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
            <div className="text-xs text-left bg-gray-100 p-3 rounded font-mono">
              <div className="font-semibold mb-2 text-gray-700">Example SQL:</div>
              <div className="text-gray-600">
                CREATE TABLE users (<br />
                &nbsp;&nbsp;id INT PRIMARY KEY,<br />
                &nbsp;&nbsp;name VARCHAR(255)<br />
                );<br />
                <br />
                -- Auto-detects PostgreSQL,<br />
                -- MySQL, MSSQL
              </div>
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
