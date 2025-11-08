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

  // Parse DBML input using ChartDB's actual parser
  useEffect(() => {
    if (!erInput.trim()) {
      clearSchema();
      setErError(null);
      return;
    }

    // importSchema is async
    const parseSchema = async () => {
      try {
        const parsed = await importSchema(erInput);
        setDiagram(parsed);
        setErError(null);
      } catch (error) {
        setErError(error instanceof Error ? error.message : 'Failed to parse DBML');
        clearSchema();
      }
    };

    parseSchema();
  }, [erInput, setDiagram, clearSchema, setErError]);

  if (!erInput.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm mb-2">Enter DBML (Database Markup Language) to see ER diagram</p>
          <div className="text-xs text-left bg-gray-100 p-3 rounded mt-4 font-mono max-w-md mx-auto">
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
          <p className="text-xs mt-4 text-gray-500">
            Note: ChartDB also supports SQL import (PostgreSQL, MySQL, SQL Server, SQLite)<br />
            but it requires ES2018+ JavaScript target. Currently using DBML only.
          </p>
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
