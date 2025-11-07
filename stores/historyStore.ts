import { create } from 'zustand';

export interface HistoryEntry {
  diagramType: 'sequence' | 'er' | 'cloud';
  input: string;
  timestamp: number;
}

export interface HistoryState {
  // Undo/redo stacks
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  // Max history size
  maxHistorySize: number;

  // Actions
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxHistorySize: 50,

  pushHistory: (entry) =>
    set((state) => {
      const newUndoStack = [...state.undoStack, entry];

      // Limit stack size
      if (newUndoStack.length > state.maxHistorySize) {
        newUndoStack.shift();
      }

      return {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack on new action
      };
    }),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;

    const lastEntry = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);

    set({
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, lastEntry],
    });

    return lastEntry;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;

    const lastEntry = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);

    set({
      redoStack: newRedoStack,
      undoStack: [...state.undoStack, lastEntry],
    });

    return lastEntry;
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  clearHistory: () => set({ undoStack: [], redoStack: [] }),
}));
