'use client';

import { create } from 'zustand';
import type { Lead, LeadStats, LeadFilters, CreateLeadData, UpdateLeadData } from '@/types/lead';
import { leadsApi, pipelineApi } from '@/lib/api';

interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  stats: LeadStats | null;
  filters: LeadFilters;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface LeadsActions {
  // CRUD
  fetchLeads: (filters?: LeadFilters, page?: number, limit?: number) => Promise<void>;
  fetchLeadById: (id: string) => Promise<Lead>;
  createLead: (data: CreateLeadData) => Promise<Lead>;
  updateLead: (id: string, data: UpdateLeadData) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;

  // Status & Assignment
  updateStatus: (id: string, status: string, reason?: string) => Promise<void>;
  assignLead: (id: string, assignedTo: string) => Promise<void>;
  bulkAssign: (leadIds: string[], assignedTo: string) => Promise<void>;
  bulkDelete: (leadIds: string[]) => Promise<void>;

  // Stats
  fetchStats: () => Promise<void>;

  // Local state
  setFilters: (filters: LeadFilters) => void;
  clearFilters: () => void;
  selectLead: (lead: Lead | null) => void;
  setError: (error: string | null) => void;
}

type LeadsStore = LeadsState & LeadsActions;

export const useLeadsStore = create<LeadsStore>((set, get) => ({
  // Initial state
  leads: [],
  selectedLead: null,
  stats: null,
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
  isLoading: false,
  error: null,

  // Fetch leads with filters
  fetchLeads: async (filters?: LeadFilters, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.getAll({ ...filters, page, limit } as LeadFilters & { page?: number; limit?: number });
      // Backend returns { success, data: { data: [...], current_page, total, per_page } } (Laravel pagination)
      const paginated = response.data || {};
      const leads = paginated.data || paginated.leads || [];
      set({
        leads: Array.isArray(leads) ? leads : [],
        pagination: {
          total: paginated.total || 0,
          page: paginated.current_page || 1,
          limit: paginated.per_page || 20,
        },
        filters: filters || get().filters,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch leads';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Fetch single lead
  fetchLeadById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.getById(id);
      // Backend returns { success, data: <lead> } directly (not wrapped in .lead)
      const lead = response.data?.lead || response.data;
      set({ selectedLead: lead, isLoading: false });
      return lead;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch lead';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Create lead
  createLead: async (data: CreateLeadData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.create(data);
      // Backend returns { success, message, data: <lead> } directly
      const newLead = response.data?.lead || response.data;
      set((state) => ({
        leads: [newLead, ...state.leads],
        isLoading: false,
      }));
      return newLead;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create lead';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Update lead
  updateLead: async (id: string, data: UpdateLeadData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.update(id, data);
      const updatedLead = response.data?.lead || response.data;
      set((state) => ({
        leads: state.leads.map((lead) => (lead.id === id ? updatedLead : lead)),
        selectedLead: state.selectedLead?.id === id ? updatedLead : state.selectedLead,
        isLoading: false,
      }));
      return updatedLead;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update lead';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Delete lead
  deleteLead: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await leadsApi.delete(id);
      set((state) => ({
        leads: state.leads.filter((lead) => lead.id !== id),
        selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete lead';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Update status
  updateStatus: async (id: string, status: string, reason?: string) => {
    try {
      const response = await leadsApi.updateStatus(id, status, reason);
      const updatedLead = response.data?.lead;
      set((state) => ({
        leads: state.leads.map((lead) => (lead.id === id ? updatedLead : lead)),
        selectedLead: state.selectedLead?.id === id ? updatedLead : state.selectedLead,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status';
      set({ error: message });
      throw error;
    }
  },

  // Assign lead
  assignLead: async (id: string, assignedTo: string) => {
    try {
      await leadsApi.assign(id, assignedTo);
      // Refresh the lead to get updated data
      await get().fetchLeadById(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign lead';
      set({ error: message });
      throw error;
    }
  },

  // Bulk assign
  bulkAssign: async (leadIds: string[], assignedTo: string) => {
    try {
      await leadsApi.bulkAssign(leadIds, assignedTo);
      // Refresh leads
      await get().fetchLeads(get().filters);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign leads';
      set({ error: message });
      throw error;
    }
  },

  // Bulk delete
  bulkDelete: async (leadIds: string[]) => {
    try {
      await leadsApi.bulkDelete(leadIds);
      set((state) => ({
        leads: state.leads.filter((lead) => !leadIds.includes(lead.id)),
        selectedLead: state.selectedLead && leadIds.includes(state.selectedLead.id) ? null : state.selectedLead,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete leads';
      set({ error: message });
      throw error;
    }
  },

  // Fetch stats
  fetchStats: async () => {
    try {
      const response = await leadsApi.getStats();
      set({ stats: response.stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stats';
      set({ error: message });
    }
  },

  // Set filters
  setFilters: (filters: LeadFilters) => {
    set({ filters });
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {} });
  },

  // Select lead
  selectLead: (lead: Lead | null) => {
    set({ selectedLead: lead });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// Pipeline store for Kanban view
interface PipelineState {
  stages: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
    leads: Lead[];
    totalValue: number;
    weightedValue: number;
    count: number;
    probability?: number;
    exitCriteria?: string[];
  }>;
  isLoading: boolean;
  error: string | null;
}

interface PipelineActions {
  fetchPipeline: () => Promise<void>;
  moveLead: (leadId: string, stageId: string, position?: number) => Promise<void>;
  moveLeadToStage: (leadId: string, fromStageId: string, toStageId: string) => void;
}

type PipelineStore = PipelineState & PipelineActions;

export const usePipelineStore = create<PipelineStore>((set) => ({
  stages: [],
  isLoading: false,
  error: null,

  fetchPipeline: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all leads for current org and group by status into pipeline stages
      const response = await leadsApi.getAll({ limit: 200 } as Parameters<typeof leadsApi.getAll>[0]);
      const allLeads: Lead[] = response.data?.data || [];

      const stageDefs = [
        { id: 'new', name: 'New Inquiry', color: '#3B82F6', order: 0, probability: 5 },
        { id: 'contacted_1', name: 'Contacted (1st)', color: '#F59E0B', order: 1, probability: 15 },
        { id: 'contacted_2', name: 'Contacted (2nd)', color: '#D97706', order: 2, probability: 25 },
        { id: 'contacted_3', name: 'Contacted (3rd)', color: '#EA580C', order: 3, probability: 35 },
        { id: 'qualified', name: 'Qualified', color: '#F97316', order: 4, probability: 50 },
        { id: 'quoted', name: 'Quote Sent', color: '#8B5CF6', order: 5, probability: 65 },
        { id: 'negotiating', name: 'Negotiating', color: '#EC4899', order: 6, probability: 80 },
        { id: 'converted', name: 'Booked', color: '#10B981', order: 7, probability: 100 },
        { id: 'lost', name: 'Lost', color: '#EF4444', order: 8, probability: 0 },
        { id: 'unresponsive', name: 'Unresponsive', color: '#6B7280', order: 9, probability: 0 },
      ];

      set({
        stages: stageDefs.map((def) => {
          const stageLeads = allLeads.filter((l) => l.status === def.id);
          const totalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
          return {
            id: def.id,
            name: def.name,
            color: def.color,
            order: def.order,
            probability: def.probability,
            exitCriteria: [],
            leads: stageLeads,
            totalValue,
            weightedValue: totalValue * (def.probability / 100),
            count: stageLeads.length,
          };
        }),
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pipeline';
      set({ error: message, isLoading: false });
    }
  },

  moveLead: async (leadId: string, stageId: string, position?: number) => {
    try {
      await pipelineApi.moveLead(leadId, stageId, position);
      // Optimistically update local state
      set((state) => {
        const stages = state.stages.map((stage) => ({
          ...stage,
          leads: stage.leads.filter((lead) => lead.id !== leadId),
        }));

        // Find the lead that was moved
        let movedLead: Lead | undefined;
        for (const stage of state.stages) {
          movedLead = stage.leads.find((lead) => lead.id === leadId);
          if (movedLead) break;
        }

        if (movedLead) {
          const targetStage = stages.find((s) => s.id === stageId);
          if (targetStage) {
            if (position !== undefined) {
              targetStage.leads.splice(position, 0, { ...movedLead, status: stageId as Lead['status'] });
            } else {
              targetStage.leads.push({ ...movedLead, status: stageId as Lead['status'] });
            }
          }
        }

        return { stages };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move lead';
      set({ error: message });
      throw error;
    }
  },

  // Optimistic local update for drag-drop (doesn't call API)
  moveLeadToStage: (leadId: string, fromStageId: string, toStageId: string) => {
    set((state) => {
      let movedLead: Lead | undefined;

      // Find and remove the lead from the source stage
      const updatedStages = state.stages.map((stage) => {
        if (stage.id === fromStageId) {
          const lead = stage.leads.find((l) => l.id === leadId);
          if (lead) {
            movedLead = { ...lead, status: toStageId as Lead['status'] };
          }
          const newLeads = stage.leads.filter((l) => l.id !== leadId);
          return {
            ...stage,
            leads: newLeads,
            totalValue: newLeads.reduce((sum, l) => sum + (l.value || 0), 0),
            count: newLeads.length,
          };
        }
        return stage;
      });

      // Add the lead to the destination stage
      if (movedLead) {
        return {
          stages: updatedStages.map((stage) => {
            if (stage.id === toStageId) {
              const newLeads = [...stage.leads, movedLead!];
              return {
                ...stage,
                leads: newLeads,
                totalValue: newLeads.reduce((sum, l) => sum + (l.value || 0), 0),
                count: newLeads.length,
              };
            }
            return stage;
          }),
        };
      }

      return { stages: updatedStages };
    });
  },
}));

// Selector hooks
export const useLeads = () => useLeadsStore((state) => state.leads);
export const useSelectedLead = () => useLeadsStore((state) => state.selectedLead);
export const useLeadStats = () => useLeadsStore((state) => state.stats);
export const useLeadsLoading = () => useLeadsStore((state) => state.isLoading);
export const usePipelineStages = () => usePipelineStore((state) => state.stages);
