/**
 * ER Diagram Schema Types
 */
export interface Column {
  name: string;
  type: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Relationship {
  from: {
    table: string;
    column: string;
  };
  to: {
    table: string;
    column: string;
  };
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface ERSchema {
  tables: Table[];
  relationships: Relationship[];
}

/**
 * Parse SQL schema
 */
export function parseSQLSchema(sql: string): ERSchema {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];

  try {
    // Split by CREATE TABLE statements
    const tableStatements = sql.match(/CREATE\s+TABLE\s+[\s\S]*?;/gi) || [];

    for (const statement of tableStatements) {
      const table = parseSQLTable(statement);
      if (table) {
        tables.push(table);
      }
    }

    // Extract relationships from foreign keys
    for (const table of tables) {
      for (const column of table.columns) {
        if (column.isForeignKey && column.references) {
          relationships.push({
            from: {
              table: table.name,
              column: column.name,
            },
            to: {
              table: column.references.table,
              column: column.references.column,
            },
            type: 'one-to-many', // Default assumption
          });
        }
      }
    }

    return { tables, relationships };
  } catch (error) {
    console.error('SQL parse error:', error);
    throw new Error('Failed to parse SQL schema');
  }
}

/**
 * Parse a single CREATE TABLE statement
 */
function parseSQLTable(statement: string): Table | null {
  try {
    // Extract table name
    const tableNameMatch = statement.match(/CREATE\s+TABLE\s+`?(\w+)`?/i);
    if (!tableNameMatch) return null;

    const tableName = tableNameMatch[1];

    // Extract column definitions
    const columnSection = statement.match(/\(([\s\S]*)\)/);
    if (!columnSection) return null;

    const columnLines = columnSection[1]
      .split(',')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('PRIMARY KEY') && !line.startsWith('FOREIGN KEY'));

    const columns: Column[] = [];

    for (const line of columnLines) {
      const column = parseSQLColumn(line);
      if (column) {
        columns.push(column);
      }
    }

    // Extract primary keys
    const pkMatch = statement.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (pkMatch) {
      const pkColumns = pkMatch[1].split(',').map((c) => c.trim().replace(/`/g, ''));
      columns.forEach((col) => {
        if (pkColumns.includes(col.name)) {
          col.isPrimaryKey = true;
        }
      });
    }

    // Extract foreign keys
    const fkMatches = statement.matchAll(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+`?(\w+)`?\s*\(([^)]+)\)/gi);
    for (const match of fkMatches) {
      const fkColumn = match[1].trim().replace(/`/g, '');
      const refTable = match[2];
      const refColumn = match[3].trim().replace(/`/g, '');

      columns.forEach((col) => {
        if (col.name === fkColumn) {
          col.isForeignKey = true;
          col.references = {
            table: refTable,
            column: refColumn,
          };
        }
      });
    }

    return {
      name: tableName,
      columns,
    };
  } catch (error) {
    console.error('Table parse error:', error);
    return null;
  }
}

/**
 * Parse a single column definition
 */
function parseSQLColumn(line: string): Column | null {
  try {
    // Basic column pattern: name type [NOT NULL] [PRIMARY KEY]
    const match = line.match(/`?(\w+)`?\s+([\w()]+)(\s+NOT\s+NULL)?(\s+PRIMARY\s+KEY)?/i);
    if (!match) return null;

    const name = match[1];
    const type = match[2];
    const nullable = !match[3];
    const isPrimaryKey = !!match[4];

    return {
      name,
      type,
      nullable,
      isPrimaryKey,
      isForeignKey: false,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Parse JSON schema
 */
export function parseJSONSchema(json: string): ERSchema {
  try {
    const data = JSON.parse(json);

    // Support multiple JSON formats
    if (Array.isArray(data)) {
      // Array of tables
      return parseTablesArray(data);
    } else if (data.tables) {
      // Object with tables property
      return parseTablesArray(data.tables);
    } else {
      throw new Error('Invalid JSON schema format');
    }
  } catch (error) {
    console.error('JSON parse error:', error);
    throw new Error('Failed to parse JSON schema: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Parse array of tables from JSON
 */
function parseTablesArray(data: any[]): ERSchema {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];

  for (const tableData of data) {
    if (!tableData.name || !tableData.columns) continue;

    const table: Table = {
      name: tableData.name,
      columns: [],
    };

    for (const colData of tableData.columns) {
      const column: Column = {
        name: colData.name || '',
        type: colData.type || 'VARCHAR',
        nullable: colData.nullable !== false,
        isPrimaryKey: colData.isPrimaryKey || colData.primaryKey || false,
        isForeignKey: !!colData.references,
        references: colData.references
          ? {
              table: colData.references.table,
              column: colData.references.column,
            }
          : undefined,
      };

      table.columns.push(column);

      // Extract relationships
      if (column.isForeignKey && column.references) {
        relationships.push({
          from: {
            table: table.name,
            column: column.name,
          },
          to: {
            table: column.references.table,
            column: column.references.column,
          },
          type: colData.relationType || 'one-to-many',
        });
      }
    }

    tables.push(table);
  }

  return { tables, relationships };
}

/**
 * Detect input format (SQL or JSON)
 */
export function detectERInputFormat(input: string): 'sql' | 'json' | 'unknown' {
  const trimmed = input.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  if (trimmed.toUpperCase().includes('CREATE TABLE')) {
    return 'sql';
  }

  return 'unknown';
}

/**
 * Parse ER input (auto-detect format)
 */
export function parseERInput(input: string): ERSchema {
  const format = detectERInputFormat(input);

  switch (format) {
    case 'sql':
      return parseSQLSchema(input);
    case 'json':
      return parseJSONSchema(input);
    default:
      throw new Error('Unable to detect input format. Please use SQL (CREATE TABLE) or JSON schema.');
  }
}
