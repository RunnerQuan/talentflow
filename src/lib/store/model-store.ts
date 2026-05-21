// ============================================================
// TalentFlow — Model Configuration Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { ModelSettings, VisionModelSettings } from '@/types';
import {
  getModelSettings,
  saveModelSettings,
  getVisionModelSettings,
  saveVisionModelSettings,
} from '@/lib/storage';

interface ModelState {
  // ---- Text model ----
  settings: ModelSettings;
  isConnected: boolean;
  isTesting: boolean;
  error: string | null;

  setModelName: (name: string) => void;
  setApiKey: (key: string) => void;
  setBaseURL: (url: string) => void;
  setConnected: (connected: boolean) => void;
  setTesting: (testing: boolean) => void;
  setError: (error: string | null) => void;

  // ---- Vision model ----
  visionSettings: VisionModelSettings;
  isVisionConnected: boolean;
  isVisionTesting: boolean;
  visionError: string | null;

  setVisionEnabled: (enabled: boolean) => void;
  setVisionModelName: (name: string) => void;
  setVisionApiKey: (key: string) => void;
  setVisionBaseURL: (url: string) => void;
  setVisionConnected: (connected: boolean) => void;
  setVisionTesting: (testing: boolean) => void;
  setVisionError: (error: string | null) => void;

  // ---- Persistence ----
  persist: () => void;
  persistVision: () => void;
  loadFromStorage: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  // ---- Text model ----
  settings: {
    modelName: '',
    apiKey: '',
    baseURL: '',
  },
  isConnected: false,
  isTesting: false,
  error: null,

  setModelName: (name) =>
    set((state) => ({
      settings: { ...state.settings, modelName: name },
      isConnected: false,
    })),

  setApiKey: (key) =>
    set((state) => ({
      settings: { ...state.settings, apiKey: key },
      isConnected: false,
    })),

  setBaseURL: (url) =>
    set((state) => ({
      settings: { ...state.settings, baseURL: url },
      isConnected: false,
    })),

  setConnected: (connected) => set({ isConnected: connected }),
  setTesting: (testing) => set({ isTesting: testing }),
  setError: (error) => set({ error }),

  // ---- Vision model ----
  visionSettings: {
    modelName: '',
    apiKey: '',
    baseURL: '',
    enabled: false,
  },
  isVisionConnected: false,
  isVisionTesting: false,
  visionError: null,

  setVisionEnabled: (enabled) =>
    set((state) => ({
      visionSettings: { ...state.visionSettings, enabled: enabled },
    })),

  setVisionModelName: (name) =>
    set((state) => ({
      visionSettings: { ...state.visionSettings, modelName: name },
      isVisionConnected: false,
    })),

  setVisionApiKey: (key) =>
    set((state) => ({
      visionSettings: { ...state.visionSettings, apiKey: key },
      isVisionConnected: false,
    })),

  setVisionBaseURL: (url) =>
    set((state) => ({
      visionSettings: { ...state.visionSettings, baseURL: url },
      isVisionConnected: false,
    })),

  setVisionConnected: (connected) => set({ isVisionConnected: connected }),
  setVisionTesting: (testing) => set({ isVisionTesting: testing }),
  setVisionError: (error) => set({ visionError: error }),

  // ---- Persistence ----
  persist: () => {
    const { settings } = get();
    saveModelSettings(settings);
  },

  persistVision: () => {
    const { visionSettings } = get();
    saveVisionModelSettings(visionSettings);
  },

  loadFromStorage: () => {
    const saved = getModelSettings();
    const visionSaved = getVisionModelSettings();
    set({ settings: saved, visionSettings: visionSaved });
  },
}));
