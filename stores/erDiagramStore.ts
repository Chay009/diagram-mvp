import { create } from 'zustand';
import type { ERSchema, Table, Relationship } from '@/lib/utils/erParser';

export interface TablePosition {
  id: string;
  x: number;
  y: number;
}

export interface ERDiagramState {
  // Schema data
  schema: ERSchema | null;

  // Table positions for canvas layout
  tablePositions: TablePosition[];

  // Selected states for UI interactions
  selectedTableId: string | null;
  selectedColumnId: string | null;

  // Zoom and pan for canvas
  zoom: number;
  panX: number;
  panY: number;

  // Actions
  setSchema: (schema: ERSchema) => void;
  clearSchema: () => void;

  // Table positioning
  setTablePosition: (tableId: string, x: number, y: number) => void;
  getTablePosition: (tableId: string) => TablePosition | undefined;
  autoLayoutTables: () => void;

  // Selection
  selectTable: (tableId: string | null) => void;
  selectColumn: (columnId: string | null) => void;

  // Canvas controls
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;

  // Helpers
  getTableById: (tableId: string) => Table | undefined;
  getRelationshipsForTable: (tableId: string) => Relationship[];
}

export const useERDiagramStore = create<ERDiagramState>((set, get) => ({
  // Initial state
  schema: null,
  tablePositions: [],
  selectedTableId: null,
  selectedColumnId: null,
  zoom: 1,
  panX: 0,
  panY: 0,

  // Schema actions
  setSchema: (schema) => {
    set({ schema });
    // Auto-layout tables when schema is set
    get().autoLayoutTables();
  },

  clearSchema: () => {
    set({
      schema: null,
      tablePositions: [],
      selectedTableId: null,
      selectedColumnId: null,
    });
  },

  // Table positioning
  setTablePosition: (tableId, x, y) => {
    set((state) => {
      const positions = state.tablePositions.filter((p) => p.id !== tableId);
      positions.push({ id: tableId, x, y });
      return { tablePositions: positions };
    });
  },

  getTablePosition: (tableId) => {
    return get().tablePositions.find((p) => p.id === tableId);
  },

  autoLayoutTables: () => {
    const state = get();
    if (!state.schema) return;

    // Simple grid layout
    const tables = state.schema.tables;
    const columns = Math.ceil(Math.sqrt(tables.length));
    const spacing = 300;
    const offsetX = 100;
    const offsetY = 100;

    const positions: TablePosition[] = tables.map((table, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      return {
        id: table.name,
        x: offsetX + col * spacing,
        y: offsetY + row * spacing,
      };
    });

    set({ tablePositions: positions });
  },

  // Selection
  selectTable: (tableId) => set({ selectedTableId: tableId }),
  selectColumn: (columnId) => set({ selectedColumnId: columnId }),

  // Canvas controls
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  // Helpers
  getTableById: (tableId) => {
    const state = get();
    return state.schema?.tables.find((t) => t.name === tableId);
  },

  getRelationshipsForTable: (tableId) => {
    const state = get();
    if (!state.schema) return [];

    return state.schema.relationships.filter(
      (r) => r.from.table === tableId || r.to.table === tableId
    );
  },
}));
