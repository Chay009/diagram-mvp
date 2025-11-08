/**
 * DBML Parser Wrapper
 * Uses ChartDB's DBML parser (@dbml/core) to parse Database Markup Language
 */

import { Parser } from '@dbml/core';

export interface DBMLTable {
  name: string;
  schema?: string;
  fields: DBMLField[];
}

export interface DBMLField {
  name: string;
  type: string;
  pk?: boolean;
  unique?: boolean;
  notNull?: boolean;
  note?: string;
}

export interface DBMLRelationship {
  from: {
    table: string;
    field: string;
  };
  to: {
    table: string;
    field: string;
  };
  type: '1-1' | '1-n' | 'n-1' | 'n-n';
}

export interface DBMLDiagram {
  tables: DBMLTable[];
  relationships: DBMLRelationship[];
}

/**
 * Parse DBML string to diagram structure
 * This is a convenience wrapper around parseDatabaseSchema
 */
export function parseDBML(dbml: string): DBMLDiagram {
  return parseDatabaseSchema(dbml, 'dbml');
}

/**
 * Parse database schema from various formats (DBML, SQL, etc.)
 * Supports: 'dbml', 'mysql', 'postgres', 'mssql', 'schemarb'
 */
export function parseDatabaseSchema(
  input: string,
  format: 'dbml' | 'mysql' | 'postgres' | 'mssql' | 'schemarb' = 'dbml'
): DBMLDiagram {
  try {
    const parser = new Parser();
    const database = parser.parse(input, format);

    const tables: DBMLTable[] = database.schemas.flatMap((schema) =>
      schema.tables.map((table) => ({
        name: table.name,
        schema: schema.name !== 'public' ? schema.name : undefined,
        fields: table.fields.map((field) => ({
          name: field.name,
          type: field.type.type_name,
          pk: field.pk ?? false,
          unique: field.unique ?? false,
          notNull: field.not_null ?? false,
          note: field.note ?? undefined,
        })),
      }))
    );

    const relationships: DBMLRelationship[] = database.schemas.flatMap((schema) =>
      schema.tables.flatMap((table) =>
        (table.fields || []).flatMap((field) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((field as any).ref?.endpoints || []).map((ref: any) => {
            const relationMapping: Record<string, '1-1' | '1-n' | 'n-1' | 'n-n'> = {
              '<>': '1-1',
              '>': '1-n',
              '<': 'n-1',
              '-': 'n-n',
            };

            return {
              from: {
                table: table.name,
                field: field.name,
              },
              to: {
                table: ref.tableName,
                field: ref.fieldNames[0],
              },
              type: relationMapping[ref.relation] || '1-n',
            };
          })
        )
      )
    );

    return { tables, relationships };
  } catch (error) {
    throw new Error(`Schema Parse Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get example DBML
 */
export function getDBMLExample(): string {
  return `Table users {
  id integer [primary key]
  username varchar
  email varchar [unique]
  created_at timestamp
}

Table posts {
  id integer [primary key]
  title varchar
  content text
  author_id integer
  created_at timestamp
}

Ref: posts.author_id > users.id`;
}
