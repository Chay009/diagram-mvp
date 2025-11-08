/**
 * ChartDB Wrapper
 * Re-exports ChartDB's actual DBML import functionality
 * This uses ChartDB's real implementation, not custom code
 *
 * NOTE: SQL import is available in ChartDB (lib/chartdb/data/sql-import) but currently
 * disabled due to ES2018 regex compatibility issues (/s flag not supported in ES2017).
 * ChartDB's SQL parsers support PostgreSQL, MySQL, SQL Server, and SQLite.
 *
 * To enable SQL import:
 * 1. Upgrade tsconfig.json target to ES2018+ (may have browser compatibility implications)
 * 2. Or manually replace all /s regex flags with alternatives in lib/chartdb/data/sql-import/
 */

import { importDBMLToDiagram } from '@/lib/chartdb/dbml/dbml-import/dbml-import';
// import { sqlImportToDiagram } from '@/lib/chartdb/data/sql-import'; // Disabled: ES2018 regex issues
import { DatabaseType } from '@/lib/chartdb/domain/database-type';
import type { Diagram } from '@/lib/chartdb/domain/diagram';

// Main import function (currently only supports DBML)
export async function importSchema(
  content: string,
  databaseType: DatabaseType = DatabaseType.GENERIC
): Promise<Diagram> {
  // TODO: Add SQL auto-detection and import when ES2018 compatibility is resolved
  // For now, always use DBML import
  return importDBMLToDiagram(content, { databaseType });
}

// Backward compatibility: keep importDBML for explicit DBML import
export async function importDBML(dbmlContent: string, databaseType: DatabaseType = DatabaseType.GENERIC): Promise<Diagram> {
  return importDBMLToDiagram(dbmlContent, { databaseType });
}

// Export the original functions if needed
export { importDBMLToDiagram };
// export { sqlImportToDiagram }; // Disabled: ES2018 regex issues

// Export ChartDB's actual types
export type { Diagram } from '@/lib/chartdb/domain/diagram';
export type { DBTable } from '@/lib/chartdb/domain/db-table';
export type { DBField } from '@/lib/chartdb/domain/db-field';
export type { DBRelationship, Cardinality, RelationshipType } from '@/lib/chartdb/domain/db-relationship';
export type { DBIndex } from '@/lib/chartdb/domain/db-index';
export type { DatabaseType } from '@/lib/chartdb/domain/database-type';

// Export ChartDB's helper functions
export { determineRelationshipType } from '@/lib/chartdb/domain/db-relationship';
