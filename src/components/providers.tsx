// ============================================================
// TalentFlow — Client Providers
// ============================================================
// Client component that initializes stores from persistent storage.

'use client';

import { useEffect } from 'react';
import { useModelStore } from '@/lib/store/model-store';
import { useResumeStore } from '@/lib/store/resume-store';
import { useMatchStore } from '@/lib/store/match-store';
import { useInterviewStore } from '@/lib/store/interview-store';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load model settings from localStorage
    useModelStore.getState().loadFromStorage();
    // Load candidate data from IndexedDB
    useResumeStore.getState().loadFromDB();
    // Load match records from IndexedDB
    useMatchStore.getState().loadFromDB();
    // Load interview records from IndexedDB
    useInterviewStore.getState().loadFromDB();
  }, []);

  return <>{children}</>;
}
