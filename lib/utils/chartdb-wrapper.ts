/**
 * ChartDB Wrapper
 * Re-exports ChartDB's actual DBML import functionality and adds SQL support via @dbml/core
 *
 * IMPORTANT NOTE ON SQL IMPORT:
 * =============================
 * ChartDB has custom SQL importers (lib/chartdb/data/sql-import/) but they require ES2018
 * JavaScript features (/s regex flag) which our project targets ES2017.
 *
 * Instead, we use @dbml/core's built-in SQL importer which:
 * - Works with ES2017 (no compatibility issues)
 * - Supports PostgreSQL, MySQL, MSSQL
 * - Is simpler and more maintainable
 * - Is the official DBML library used by dbdiagram.io
 *
 * Flow: SQL → DBML (@dbml/core) → Diagram (ChartDB)
 *
 * If you need ChartDB's advanced SQL features (pg_dump detection, SQLite support, etc.),
 * you must upgrade tsconfig.json target to ES2018+ and enable lib/chartdb/data/sql-import/
 */

import { importer } from '@dbml/core';
import { importDBMLToDiagram } from '@/lib/chartdb/dbml/dbml-import/dbml-import';
import { DatabaseType } from '@/lib/chartdb/domain/database-type';
import type { Diagram } from '@/lib/chartdb/domain/diagram';

/**
 * Detect if input is DBML or SQL
 */
function detectInputFormat(content: string): 'dbml' | 'sql' {
  const trimmed = content.trim().toLowerCase();

  // SQL keywords (must come first to catch SQL)
  const sqlKeywords = ['create table', 'alter table', 'drop table', 'create index', 'foreign key'];
  const hasSQLKeywords = sqlKeywords.some(keyword => trimmed.includes(keyword));

  if (hasSQLKeywords) {
    return 'sql';
  }

  // Default to DBML
  return 'dbml';
}

/**
 * Detect SQL dialect from content
 */
function detectSQLDialect(content: string): 'postgres' | 'mysql' | 'mssql' {
  const lower = content.toLowerCase();

  // MySQL indicators
  if (lower.includes('auto_increment') || lower.includes('engine=innodb') || lower.includes('`')) {
    return 'mysql';
  }

  // MSSQL indicators
  if (lower.includes('[dbo]') || lower.includes('nvarchar') || lower.includes('identity(')) {
    return 'mssql';
  }

  // Default to PostgreSQL (most common)
  return 'postgres';
}

/**
 * Smart import function that auto-detects DBML or SQL and uses the appropriate parser
 */
export async function importSchema(
  content: string,
  databaseType: DatabaseType = DatabaseType.GENERIC
): Promise<Diagram> {
  const format = detectInputFormat(content);

  if (format === 'sql') {
    // Step 1: SQL → DBML using @dbml/core
    const dialect = detectSQLDialect(content);
    const dbml = importer.import(content, dialect);

    // Step 2: DBML → Diagram using ChartDB
    return importDBMLToDiagram(dbml, { databaseType });
  } else {
    // Direct DBML → Diagram using ChartDB
    return importDBMLToDiagram(content, { databaseType });
  }
}

// Backward compatibility: keep importDBML for explicit DBML import
export async function importDBML(dbmlContent: string, databaseType: DatabaseType = DatabaseType.GENERIC): Promise<Diagram> {
  return importDBMLToDiagram(dbmlContent, { databaseType });
}

// Export the original function if needed
export { importDBMLToDiagram };

// Export ChartDB's actual types
export type { Diagram } from '@/lib/chartdb/domain/diagram';
export type { DBTable } from '@/lib/chartdb/domain/db-table';
export type { DBField } from '@/lib/chartdb/domain/db-field';
export type { DBRelationship, Cardinality, RelationshipType } from '@/lib/chartdb/domain/db-relationship';
export type { DBIndex } from '@/lib/chartdb/domain/db-index';
export type { DatabaseType } from '@/lib/chartdb/domain/database-type';

// Export ChartDB's helper functions
export { determineRelationshipType } from '@/lib/chartdb/domain/db-relationship';
