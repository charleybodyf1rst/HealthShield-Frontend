'use client';

import { create } from 'zustand';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 'stage' | 'tool' | 'diagnostic' | 'status' | 'state';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;       // 'pusher' | 'backend' | 'frontend' | 'timeout'
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
}

export type LogFilter = {
  level: 'all' | LogLevel;
  category: 'all' | LogCategory;
};

interface EventLogState {
  entries: LogEntry[];
  maxEntries: number;
  filter: LogFilter;

  // Actions
  addEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLog: () => void;
  setFilter: (filter: Partial<LogFilter>) => void;
}

let entryCounter = 0;

export const useEventLogStore = create<EventLogState>()((set) => ({
  entries: [],
  maxEntries: 500,
  filter: { level: 'all', category: 'all' },

  addEntry: (entry) => {
    const id = `log-${++entryCounter}-${Date.now()}`;
    const newEntry: LogEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const updated = [...state.entries, newEntry];
      // Trim to max entries
      if (updated.length > state.maxEntries) {
        return { entries: updated.slice(updated.length - state.maxEntries) };
      }
      return { entries: updated };
    });
  },

  clearLog: () => set({ entries: [] }),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),
}));

// Selector for filtered entries
export const useFilteredLogEntries = () =>
  useEventLogStore((state) => {
    const { entries, filter } = state;
    return entries.filter((e) => {
      if (filter.level !== 'all' && e.level !== filter.level) return false;
      if (filter.category !== 'all' && e.category !== filter.category) return false;
      return true;
    });
  });

// Quick selectors
export const useLogEntryCount = () => useEventLogStore((s) => s.entries.length);
export const useLogFilter = () => useEventLogStore((s) => s.filter);
