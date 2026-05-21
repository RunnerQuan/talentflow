// ============================================================
// TalentFlow — LocalStorage Utilities
// ============================================================

import type { ModelSettings, VisionModelSettings } from '@/types';

const STORAGE_KEYS = {
  MODEL_SETTINGS: 'talentflow_model_settings',
  VISION_MODEL_SETTINGS: 'talentflow_vision_model_settings',
  RESUME_DATA: 'talentflow_resume_data',
  MATCH_RESULTS: 'talentflow_match_results',
  EFFICIENCY_STATS: 'talentflow_efficiency_stats',
} as const;

const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  modelName: '',
  apiKey: '',
  baseURL: '',
};

const DEFAULT_VISION_MODEL_SETTINGS: VisionModelSettings = {
  modelName: '',
  apiKey: '',
  baseURL: '',
  enabled: false,
};

/**
 * Safely read a JSON value from localStorage.
 * Returns the fallback if the key doesn't exist or parsing fails.
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely write a JSON value to localStorage.
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] Failed to write key "${key}"`);
  }
}

/**
 * Remove a key from localStorage.
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ---- Model Settings ----

export function getModelSettings(): ModelSettings {
  return getStorageItem(STORAGE_KEYS.MODEL_SETTINGS, DEFAULT_MODEL_SETTINGS);
}

export function saveModelSettings(settings: ModelSettings): void {
  setStorageItem(STORAGE_KEYS.MODEL_SETTINGS, settings);
}

// ---- Vision Model Settings ----

export function getVisionModelSettings(): VisionModelSettings {
  return getStorageItem(STORAGE_KEYS.VISION_MODEL_SETTINGS, DEFAULT_VISION_MODEL_SETTINGS);
}

export function saveVisionModelSettings(settings: VisionModelSettings): void {
  setStorageItem(STORAGE_KEYS.VISION_MODEL_SETTINGS, settings);
}

// ---- Resume Data ----

export function getResumeData<T>(): T | null {
  return getStorageItem<T | null>(STORAGE_KEYS.RESUME_DATA, null);
}

export function saveResumeData<T>(data: T): void {
  setStorageItem(STORAGE_KEYS.RESUME_DATA, data);
}

// ---- Match Results ----

export function getMatchResults<T>(): T | null {
  return getStorageItem<T | null>(STORAGE_KEYS.MATCH_RESULTS, null);
}

export function saveMatchResults<T>(data: T): void {
  setStorageItem(STORAGE_KEYS.MATCH_RESULTS, data);
}

// ---- Efficiency Stats ----

export function getEfficiencyStats<T>(): T | null {
  return getStorageItem<T | null>(STORAGE_KEYS.EFFICIENCY_STATS, null);
}

export function saveEfficiencyStats<T>(data: T): void {
  setStorageItem(STORAGE_KEYS.EFFICIENCY_STATS, data);
}

export { STORAGE_KEYS };
