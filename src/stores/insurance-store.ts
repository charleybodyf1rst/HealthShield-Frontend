'use client';

import { create } from 'zustand';
import type { InsuranceProgram, Enrollment, Proposal, WellnessMetric, InsuranceStats } from '@/types/insurance';
import { insuranceApi } from '@/lib/api';

interface InsuranceState {
  programs: InsuranceProgram[];
  selectedProgram: InsuranceProgram | null;
  enrollments: Enrollment[];
  proposals: Proposal[];
  wellnessMetrics: WellnessMetric[];
  stats: InsuranceStats | null;
  isLoading: boolean;
  error: string | null;
}

interface InsuranceActions {
  // Programs
  fetchPrograms: () => Promise<void>;
  fetchProgram: (id: string) => Promise<void>;
  createProgram: (data: Record<string, any>) => Promise<InsuranceProgram>;
  updateProgram: (id: string, data: Record<string, any>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;

  // Enrollments
  fetchEnrollments: (programId: string) => Promise<void>;
  enrollInProgram: (programId: string, data: Record<string, any>) => Promise<void>;

  // Proposals
  fetchProposals: () => Promise<void>;
  createProposal: (data: Record<string, any>) => Promise<Proposal>;

  // Wellness & Stats
  fetchWellnessMetrics: () => Promise<void>;
  fetchStats: () => Promise<void>;

  // Local state
  clearError: () => void;
}

export const useInsuranceStore = create<InsuranceState & InsuranceActions>((set) => ({
  programs: [],
  selectedProgram: null,
  enrollments: [],
  proposals: [],
  wellnessMetrics: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.getPrograms();
      set({ programs: response.data || response, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch programs', isLoading: false });
    }
  },

  fetchProgram: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.getProgram(id);
      set({ selectedProgram: response.data || response, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch program', isLoading: false });
    }
  },

  createProgram: async (data: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.createProgram(data);
      const program = response.data || response;
      set((state) => ({ programs: [...state.programs, program], isLoading: false }));
      return program;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create program', isLoading: false });
      throw error;
    }
  },

  updateProgram: async (id: string, data: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.updateProgram(id, data);
      const updated = response.data || response;
      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? updated : p)),
        selectedProgram: state.selectedProgram?.id === id ? updated : state.selectedProgram,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update program', isLoading: false });
      throw error;
    }
  },

  deleteProgram: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await insuranceApi.deleteProgram(id);
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete program', isLoading: false });
      throw error;
    }
  },

  fetchEnrollments: async (programId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.getEnrollments(programId);
      set({ enrollments: response.data || response, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch enrollments', isLoading: false });
    }
  },

  enrollInProgram: async (programId: string, data: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      await insuranceApi.enroll(programId, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to enroll', isLoading: false });
      throw error;
    }
  },

  fetchProposals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.getProposals();
      set({ proposals: response.data || response, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch proposals', isLoading: false });
    }
  },

  createProposal: async (data: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.createProposal(data);
      const proposal = response.data || response;
      set((state) => ({ proposals: [...state.proposals, proposal], isLoading: false }));
      return proposal;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create proposal', isLoading: false });
      throw error;
    }
  },

  fetchWellnessMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.getWellnessMetrics();
      set({ wellnessMetrics: response.data || response, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch wellness metrics', isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await insuranceApi.getStats();
      set({ stats: response.data || response, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stats', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
