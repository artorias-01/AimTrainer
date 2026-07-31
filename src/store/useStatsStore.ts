import { create } from 'zustand';
import { getStoredSessions, getPersonalBests, clearSessionHistory } from '../utils/storage';
import type { SessionResult, PersonalBest } from '../utils/storage';

interface StatsState {
  sessions: SessionResult[];
  personalBests: Record<string, PersonalBest>;
  selectedScenarioFilter: string;

  refreshStats: () => void;
  setScenarioFilter: (id: string) => void;
  clearHistory: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  sessions: getStoredSessions(),
  personalBests: getPersonalBests(),
  selectedScenarioFilter: 'all',

  refreshStats: () => {
    set({
      sessions: getStoredSessions(),
      personalBests: getPersonalBests(),
    });
  },

  setScenarioFilter: (id) => {
    set({ selectedScenarioFilter: id });
  },

  clearHistory: () => {
    clearSessionHistory();
    set({
      sessions: [],
      personalBests: {},
    });
  },
}));
