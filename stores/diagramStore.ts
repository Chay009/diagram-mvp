import { create } from 'zustand';

export type DiagramType = 'sequence' | 'er' | 'cloud';

export interface DiagramState {
  // Current diagram type
  currentDiagramType: DiagramType;

  // Input code/syntax for each diagram type
  sequenceInput: string;
  erInput: string;
  cloudInput: string;

  // Validation errors
  sequenceError: string | null;
  erError: string | null;
  cloudError: string | null;

  // Actions
  setDiagramType: (type: DiagramType) => void;
  setSequenceInput: (input: string) => void;
  setErInput: (input: string) => void;
  setCloudInput: (input: string) => void;
  setSequenceError: (error: string | null) => void;
  setErError: (error: string | null) => void;
  setCloudError: (error: string | null) => void;

  // Get current input based on diagram type
  getCurrentInput: () => string;
  setCurrentInput: (input: string) => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  // Initial state
  currentDiagramType: 'sequence',
  sequenceInput: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!`,
  erInput: '',
  cloudInput: '',
  sequenceError: null,
  erError: null,
  cloudError: null,

  // Actions
  setDiagramType: (type) => set({ currentDiagramType: type }),

  setSequenceInput: (input) => set({ sequenceInput: input }),
  setErInput: (input) => set({ erInput: input }),
  setCloudInput: (input) => set({ cloudInput: input }),

  setSequenceError: (error) => set({ sequenceError: error }),
  setErError: (error) => set({ erError: error }),
  setCloudError: (error) => set({ cloudError: error }),

  getCurrentInput: () => {
    const state = get();
    switch (state.currentDiagramType) {
      case 'sequence':
        return state.sequenceInput;
      case 'er':
        return state.erInput;
      case 'cloud':
        return state.cloudInput;
      default:
        return '';
    }
  },

  setCurrentInput: (input) => {
    const state = get();
    switch (state.currentDiagramType) {
      case 'sequence':
        set({ sequenceInput: input });
        break;
      case 'er':
        set({ erInput: input });
        break;
      case 'cloud':
        set({ cloudInput: input });
        break;
    }
  },
}));
