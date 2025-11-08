/**
 * ChartDB Wrapper
 * Re-exports ChartDB's actual DBML import/export functionality
 * This uses ChartDB's real implementation, not custom code
 */

import { importDBMLToDiagram } from '@/lib/chartdb/dbml/dbml-import/dbml-import';
import { DatabaseType } from '@/lib/chartdb/domain/database-type';
import type { Diagram } from '@/lib/chartdb/domain/diagram';

// Wrapper that provides a simpler API with default database type
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
