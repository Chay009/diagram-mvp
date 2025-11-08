/**
 * ChartDB Integration
 * Uses ChartDB's actual DBML parser with minimal adapters for missing dependencies
 */

import { Parser } from '@dbml/core';

// ChartDB-compatible types (simplified for our use case)
export interface DBField {
    id: string;
    name: string;
    type: {
        id: string;
        name: string;
    };
    primaryKey: boolean;
    unique: boolean;
    nullable: boolean;
    default?: string | null;
    comments?: string | null;
}

export interface DBTable {
    id: string;
    name: string;
    schema?: string | null;
    x: number;
    y: number;
    fields: DBField[];
    color: string;
}

export interface DBRelationship {
    id: string;
    name: string;
    sourceTableId: string;
    targetTableId: string;
    sourceFieldId: string;
    targetFieldId: string;
    type: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
}

export interface Diagram {
    id: string;
    name: string;
    tables: DBTable[];
    relationships: DBRelationship[];
}

// Utility functions that ChartDB needs
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateDiagramId = (): string => {
    return generateId();
};

// Default colors
export const defaultTableColor = '#3b82f6';

/**
 * Preprocess DBML content (from ChartDB)
 * Handles unsupported syntax like TableGroup, array types, etc.
 */
export const preprocessDBML = (content: string): string => {
    let processed = content;

    // Remove TableGroup blocks (not supported by parser)
    // Use [\s\S]* instead of .* with 's' flag for ES2017 compatibility
    processed = processed.replace(/TableGroup\s+[^{]*\{[\s\S]*?\}/g, '');

    // Remove Note blocks
    processed = processed.replace(/Note\s+\w+\s*\{[\s\S]*?\}/g, '');

    // Convert array syntax for DBML parser (keep the base type, remove [])
    processed = processed.replace(/(\w+(?:\(\d+(?:,\s*\d+)?\))?)\[\]/g, '$1');

    // Handle inline enum types without values by converting to varchar
    processed = processed.replace(
        /^\s*(\w+)\s+enum\s*(?:\/\/.*)?$/gm,
        '$1 varchar'
    );

    // Handle Table headers with color attributes
    processed = processed.replace(
        /Table\s+((?:"[^"]+"\."[^"]+")|(?:\w+))\s*\[[^\]]*\]\s*\{/g,
        'Table $1 {'
    );

    return processed;
};

/**
 * Import DBML using ChartDB's approach
 * Based on ChartDB's dbml-import.ts
 */
export function importDBML(content: string): Diagram {
    try {
        // Preprocess DBML content
        const processed = preprocessDBML(content);

        // Parse DBML using @dbml/core
        const parser = new Parser();
        const database = parser.parse(processed, 'dbml');

        // Convert to our diagram format
        const tables: DBTable[] = [];
        const relationships: DBRelationship[] = [];
        const tableIdMap = new Map<string, string>();

        // Process schemas and tables
        for (const schema of database.schemas) {
            for (const table of schema.tables) {
                const tableId = generateId();
                const tableName = table.name;
                const schemaName = schema.name !== 'public' ? schema.name : null;
                const tableKey = schemaName ? `${schemaName}.${tableName}` : tableName;

                tableIdMap.set(tableKey, tableId);

                const fields: DBField[] = table.fields.map((field) => {
                    const fieldId = generateId();

                    return {
                        id: fieldId,
                        name: field.name,
                        type: {
                            id: field.type.type_name.toLowerCase(),
                            name: field.type.type_name,
                        },
                        primaryKey: field.pk ?? false,
                        unique: field.unique ?? false,
                        nullable: !field.not_null,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        default: (field as any).dbdefault?.value ?? null,
                        comments: field.note ?? null,
                    };
                });

                // Simple grid layout for positioning
                const index = tables.length;
                const columns = Math.ceil(Math.sqrt(database.schemas.reduce((acc, s) => acc + s.tables.length, 0)));
                const row = Math.floor(index / columns);
                const col = index % columns;

                tables.push({
                    id: tableId,
                    name: tableName,
                    schema: schemaName,
                    x: 100 + col * 300,
                    y: 100 + row * 300,
                    fields,
                    color: defaultTableColor,
                });
            }
        }

        // Process relationships from refs
        for (const schema of database.schemas) {
            for (const table of schema.tables) {
                const sourceTableKey = schema.name !== 'public' ? `${schema.name}.${table.name}` : table.name;
                const sourceTableId = tableIdMap.get(sourceTableKey);

                if (!sourceTableId) continue;

                const sourceTable = tables.find(t => t.id === sourceTableId);
                if (!sourceTable) continue;

                for (const field of table.fields) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const fieldRef = (field as any).ref;
                    if (!fieldRef?.endpoints) continue;

                    for (const endpoint of fieldRef.endpoints) {
                        const targetTableName = endpoint.tableName;
                        const targetFieldName = endpoint.fieldNames?.[0];

                        if (!targetFieldName) continue;

                        // Find target table
                        const targetTableKey = endpoint.schemaName && endpoint.schemaName !== 'public'
                            ? `${endpoint.schemaName}.${targetTableName}`
                            : targetTableName;
                        const targetTableId = tableIdMap.get(targetTableKey);

                        if (!targetTableId) continue;

                        const targetTable = tables.find(t => t.id === targetTableId);
                        if (!targetTable) continue;

                        // Find source and target fields
                        const sourceField = sourceTable.fields.find(f => f.name === field.name);
                        const targetField = targetTable.fields.find(f => f.name === targetFieldName);

                        if (!sourceField || !targetField) continue;

                        // Map DBML relationship types
                        const relationTypeMap: Record<string, 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'> = {
                            '<>': 'one_to_one',
                            '>': 'many_to_one',
                            '<': 'one_to_many',
                            '-': 'many_to_many',
                        };

                        const relationType = relationTypeMap[endpoint.relation] || 'one_to_many';

                        relationships.push({
                            id: generateId(),
                            name: `${sourceTable.name}.${sourceField.name} → ${targetTable.name}.${targetField.name}`,
                            sourceTableId: sourceTableId,
                            targetTableId: targetTableId,
                            sourceFieldId: sourceField.id,
                            targetFieldId: targetField.id,
                            type: relationType,
                        });
                    }
                }
            }
        }

        return {
            id: generateDiagramId(),
            name: 'DBML Import',
            tables,
            relationships,
        };
    } catch (error) {
        throw new Error(`DBML Import Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parse database schema from various formats using @dbml/core
 * Supports: 'dbml', 'mysql', 'postgres', 'mssql', 'schemarb'
 */
export function parseDatabase(
    input: string,
    format: 'dbml' | 'mysql' | 'postgres' | 'mssql' | 'schemarb' = 'dbml'
): Diagram {
    if (format === 'dbml') {
        return importDBML(input);
    }

    try {
        // For SQL formats, parse directly then convert to DBML and import
        const parser = new Parser();
        const database = parser.parse(input, format);

        // Convert parsed database back to DBML string, then import
        // This ensures we use the same import logic for all formats
        const dbmlContent = convertDatabaseToDBML(database);
        return importDBML(dbmlContent);
    } catch (error) {
        throw new Error(`Database Parse Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Convert @dbml/core Database to DBML string
 * Simple converter for SQL inputs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertDatabaseToDBML(database: any): string {
    let dbml = '';

    for (const schema of database.schemas) {
        for (const table of schema.tables) {
            const schemaPrefix = schema.name !== 'public' ? `"${schema.name}".` : '';
            dbml += `Table ${schemaPrefix}${table.name} {\n`;

            for (const field of table.fields) {
                const attrs: string[] = [];

                if (field.pk) attrs.push('primary key');
                if (field.unique) attrs.push('unique');
                if (field.not_null) attrs.push('not null');
                if (field.increment) attrs.push('increment');

                const attrStr = attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
                dbml += `  ${field.name} ${field.type.type_name}${attrStr}\n`;
            }

            dbml += '}\n\n';
        }
    }

    return dbml;
}
