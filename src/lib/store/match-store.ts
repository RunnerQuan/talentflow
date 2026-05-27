// ============================================================
// TalentFlow — Match Result Store (Zustand + IndexedDB)
// ============================================================

import { create } from 'zustand';
import type { ExplainableMatchResult, MatchResultRecord } from '@/types';
import {
  getAllMatches,
  putMatch as dbPutMatch,
} from '@/lib/db';

interface MatchState {
  /** Persisted match records from IndexedDB */
  records: MatchResultRecord[];
  /** In-memory match results from current session */
  results: ExplainableMatchResult[];
  activeResultIndex: number;
  jdText: string;
  isMatching: boolean;
  isLoading: boolean;
  error: string | null;

  /** Load all match records from IndexedDB. */
  loadFromDB: () => Promise<void>;
  /** Persist a match record to IndexedDB. */
  addRecord: (record: MatchResultRecord) => Promise<void>;
  /** Get match records for a specific candidate. */
  getByCandidate: (candidateId: string) => MatchResultRecord[];
  /** In-memory session result management. */
  addResult: (result: ExplainableMatchResult) => void;
  setActiveResult: (index: number) => void;
  setJdText: (text: string) => void;
  setMatching: (val: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
  activeResult: () => ExplainableMatchResult | null;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  records: [],
  results: [],
  activeResultIndex: 0,
  jdText: '',
  isMatching: false,
  isLoading: false,
  error: null,

  loadFromDB: async () => {
    set({ isLoading: true });
    try {
      const records = await getAllMatches();
      set({ records, isLoading: false });
    } catch (err) {
      console.error('[match-store] Failed to load from DB:', err);
      set({ isLoading: false });
    }
  },

  addRecord: async (record) => {
    try {
      await dbPutMatch(record);
      set((state) => ({ records: [...state.records, record] }));
    } catch (err) {
      console.error('[match-store] Failed to save record:', err);
    }
  },

  getByCandidate: (candidateId) => {
    return get().records.filter((r) => r.candidateId === candidateId);
  },

  addResult: (result) =>
    set((state) => ({
      results: [...state.results, result],
      activeResultIndex: state.results.length,
    })),

  setActiveResult: (index) => set({ activeResultIndex: index }),
  setJdText: (text) => set({ jdText: text }),
  setMatching: (val) => set({ isMatching: val }),
  setError: (error) => set({ error }),

  clearResults: () =>
    set({
      results: [],
      activeResultIndex: 0,
      isMatching: false,
      error: null,
    }),

  activeResult: () => {
    const { results, activeResultIndex } = get();
    return results[activeResultIndex] || null;
  },
}));
