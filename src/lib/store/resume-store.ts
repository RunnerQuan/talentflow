// ============================================================
// TalentFlow — Resume Data Store (Zustand + IndexedDB)
// ============================================================

import { create } from 'zustand';
import type { CandidateRecord } from '@/types';
import {
  getAllCandidates,
  putCandidate,
  deleteCandidate as dbDeleteCandidate,
} from '@/lib/db';

interface ResumeState {
  candidates: CandidateRecord[];
  activeCandidateIndex: number;
  isUploading: boolean;
  isLoading: boolean;
  error: string | null;

  /** Load all candidates from IndexedDB on startup. */
  loadFromDB: () => Promise<void>;
  /** Persist a new candidate to IndexedDB and add to state. */
  addCandidate: (candidate: CandidateRecord) => Promise<void>;
  /** Partially update a candidate by ID. */
  updateCandidate: (
    id: string,
    partial: Partial<CandidateRecord>
  ) => Promise<void>;
  /** Remove a candidate and all related data. */
  removeCandidate: (id: string) => Promise<void>;
  setActiveCandidate: (index: number) => void;
  setUploading: (val: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
  /** Get the currently active candidate (derived). */
  activeCandidate: () => CandidateRecord | null;
  /** Find a candidate by ID. */
  getById: (id: string) => CandidateRecord | undefined;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  candidates: [],
  activeCandidateIndex: 0,
  isUploading: false,
  isLoading: false,
  error: null,

  loadFromDB: async () => {
    set({ isLoading: true });
    try {
      const candidates = await getAllCandidates();
      set({ candidates, isLoading: false });
    } catch (err) {
      console.error('[resume-store] Failed to load from DB:', err);
      set({ error: '加载候选人数据失败', isLoading: false });
    }
  },

  addCandidate: async (candidate) => {
    try {
      await putCandidate(candidate);
      set((state) => ({
        candidates: [...state.candidates, candidate],
        activeCandidateIndex: state.candidates.length,
      }));
    } catch (err) {
      console.error('[resume-store] Failed to add candidate:', err);
      set({ error: '保存候选人数据失败' });
    }
  },

  updateCandidate: async (id, partial) => {
    const { candidates } = get();
    const existing = candidates.find((c) => c.id === id);
    if (!existing) return;

    const updated: CandidateRecord = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    try {
      await putCandidate(updated);
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === id ? updated : c
        ),
      }));
    } catch (err) {
      console.error('[resume-store] Failed to update candidate:', err);
      set({ error: '更新候选人数据失败' });
    }
  },

  removeCandidate: async (id) => {
    try {
      await dbDeleteCandidate(id);
      set((state) => {
        const filtered = state.candidates.filter((c) => c.id !== id);
        return {
          candidates: filtered,
          activeCandidateIndex: Math.min(
            state.activeCandidateIndex,
            Math.max(0, filtered.length - 1)
          ),
        };
      });
    } catch (err) {
      console.error('[resume-store] Failed to remove candidate:', err);
      set({ error: '删除候选人失败' });
    }
  },

  setActiveCandidate: (index) => set({ activeCandidateIndex: index }),
  setUploading: (val) => set({ isUploading: val }),
  setError: (error) => set({ error }),

  clearAll: () =>
    set({
      candidates: [],
      activeCandidateIndex: 0,
      isUploading: false,
      isLoading: false,
      error: null,
    }),

  activeCandidate: () => {
    const { candidates, activeCandidateIndex } = get();
    return candidates[activeCandidateIndex] || null;
  },

  getById: (id) => {
    return get().candidates.find((c) => c.id === id);
  },
}));
