import { create } from 'zustand';
import type { Diagram, DBTable, DBRelationship } from '@/lib/utils/chartdb-wrapper';

export interface ERDiagramState {
  // ChartDB diagram data
  diagram: Diagram | null;

  // Selected states for UI interactions
  selectedTableId: string | null;
  selectedColumnId: string | null;

  // Zoom and pan for canvas
  zoom: number;
  panX: number;
  panY: number;

  // Actions
  setDiagram: (diagram: Diagram) => void;
  clearSchema: () => void;

  // Table positioning (now handled by diagram.tables[].x and y)
  setTablePosition: (tableId: string, x: number, y: number) => void;

  // Selection
  selectTable: (tableId: string | null) => void;
  selectColumn: (columnId: string | null) => void;

  // Canvas controls
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;

  // Helpers
  getTableById: (tableId: string) => DBTable | undefined;
  getRelationshipsForTable: (tableId: string) => DBRelationship[];
}

export const useERDiagramStore = create<ERDiagramState>((set, get) => ({
  // Initial state
  diagram: null,
  selectedTableId: null,
  selectedColumnId: null,
  zoom: 1,
  panX: 0,
  panY: 0,

  // Diagram actions
  setDiagram: (diagram) => {
    set({ diagram });
  },

  clearSchema: () => {
    set({
      diagram: null,
      selectedTableId: null,
      selectedColumnId: null,
    });
  },

  // Table positioning (now handled by mutating diagram.tables)
  setTablePosition: (tableId, x, y) => {
    set((state) => {
      if (!state.diagram) return state;

      const updatedTables = state.diagram.tables.map((table) =>
        table.id === tableId ? { ...table, x, y } : table
      );

      return {
        diagram: {
          ...state.diagram,
          tables: updatedTables,
        },
      };
    });
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
    return state.diagram?.tables.find((t) => t.id === tableId);
  },

  getRelationshipsForTable: (tableId) => {
    const state = get();
    if (!state.diagram) return [];

    return state.diagram.relationships.filter(
      (r) => r.sourceTableId === tableId || r.targetTableId === tableId
    );
  },
}));
