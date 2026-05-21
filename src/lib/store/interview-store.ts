// ============================================================
// TalentFlow — Interview Record Store (Zustand + IndexedDB)
// ============================================================

import { create } from 'zustand';
import type { InterviewRecord } from '@/types';
import {
  getAllInterviews,
  putInterview as dbPutInterview,
} from '@/lib/db';

interface InterviewState {
  records: InterviewRecord[];
  isLoading: boolean;

  /** Load all interview records from IndexedDB. */
  loadFromDB: () => Promise<void>;
  /** Persist an interview record to IndexedDB. */
  addRecord: (record: InterviewRecord) => Promise<void>;
  /** Get interview records for a specific candidate. */
  getByCandidate: (candidateId: string) => InterviewRecord[];
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  records: [],
  isLoading: false,

  loadFromDB: async () => {
    set({ isLoading: true });
    try {
      const records = await getAllInterviews();
      set({ records, isLoading: false });
    } catch (err) {
      console.error('[interview-store] Failed to load from DB:', err);
      set({ isLoading: false });
    }
  },

  addRecord: async (record) => {
    try {
      await dbPutInterview(record);
      set((state) => ({ records: [...state.records, record] }));
    } catch (err) {
      console.error('[interview-store] Failed to save record:', err);
    }
  },

  getByCandidate: (candidateId) => {
    return get().records.filter((r) => r.candidateId === candidateId);
  },
}));
