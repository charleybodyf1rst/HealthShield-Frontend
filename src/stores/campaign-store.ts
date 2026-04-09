'use client';

import { create } from 'zustand';
import { campaignsApi, communicationApi } from '@/lib/api';
import type { Campaign, CampaignCreateData } from '@/lib/api';
import type { WizardState, AudienceFilters, AudienceEstimate, CampaignTemplate } from '@/types/campaign';
import { DEFAULT_WIZARD_STATE } from '@/types/campaign';

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  templates: CampaignTemplate[];
  wizard: WizardState;
  isLoading: boolean;
  isSending: boolean;
  isEstimating: boolean;
  isGenerating: boolean;
  error: string | null;
  pagination: { total: number; page: number; perPage: number };
}

interface CampaignActions {
  fetchCampaigns: (params?: { status?: string; type?: string; search?: string; page?: number }) => Promise<void>;
  fetchCampaignById: (id: string) => Promise<Campaign>;
  createCampaign: (data: CampaignCreateData) => Promise<Campaign>;
  sendCampaign: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  estimateAudience: (filters: AudienceFilters) => Promise<AudienceEstimate>;
  // Wizard
  setWizardStep: (step: number) => void;
  updateWizard: (updates: Partial<WizardState>) => void;
  resetWizard: () => void;
  // AI
  aiGenerateDraft: (purpose: string, tone?: string) => Promise<{ subject: string; body: string }>;
  aiSuggestSubjects: (body: string) => Promise<string[]>;
  aiImproveTone: (body: string, tone: string) => Promise<string>;
}

type CampaignStore = CampaignState & CampaignActions;

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  templates: [],
  wizard: { ...DEFAULT_WIZARD_STATE },
  isLoading: false,
  isSending: false,
  isEstimating: false,
  isGenerating: false,
  error: null,
  pagination: { total: 0, page: 1, perPage: 20 },

  fetchCampaigns: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsApi.getCampaigns(params as Parameters<typeof campaignsApi.getCampaigns>[0]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = response as any;
      const campaigns = Array.isArray(raw?.data) ? raw.data : raw?.data?.data || [];
      set({
        campaigns,
        isLoading: false,
        pagination: {
          total: raw?.total || raw?.data?.total || campaigns.length,
          page: raw?.current_page || raw?.data?.current_page || 1,
          perPage: raw?.per_page || raw?.data?.per_page || 20,
        },
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch campaigns', isLoading: false });
    }
  },

  fetchCampaignById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsApi.getCampaign(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const campaign = (response as any)?.data || response;
      set({ selectedCampaign: campaign, isLoading: false });
      return campaign;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch campaign', isLoading: false });
      throw error;
    }
  },

  createCampaign: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsApi.createCampaign(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const campaign = (response as any)?.data || response;
      set((state) => ({
        campaigns: [campaign, ...state.campaigns],
        isLoading: false,
      }));
      return campaign;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create campaign', isLoading: false });
      throw error;
    }
  },

  sendCampaign: async (id) => {
    set({ isSending: true, error: null });
    try {
      await campaignsApi.sendCampaign(id);
      set((state) => ({
        campaigns: state.campaigns.map((c) => c.id === id ? { ...c, status: 'active' as const } : c),
        isSending: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to send campaign', isSending: false });
      throw error;
    }
  },

  deleteCampaign: async (id) => {
    try {
      await campaignsApi.deleteCampaign(id);
      set((state) => ({
        campaigns: state.campaigns.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete campaign' });
      throw error;
    }
  },

  fetchTemplates: async () => {
    try {
      const response = await campaignsApi.getTemplates();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = response as any;
      const templates = raw?.data || raw?.templates || [];
      set({ templates: Array.isArray(templates) ? templates : [] });
    } catch {
      // Templates are optional — fail silently
      set({ templates: [] });
    }
  },

  estimateAudience: async (filters) => {
    set({ isEstimating: true });
    try {
      const result = await campaignsApi.estimateAudience(filters);
      set((state) => ({
        wizard: { ...state.wizard, audienceCount: result.count },
        isEstimating: false,
      }));
      return result;
    } catch {
      set({ isEstimating: false });
      return { count: 0, sample: [] };
    }
  },

  setWizardStep: (step) => set((state) => ({ wizard: { ...state.wizard, step } })),
  updateWizard: (updates) => set((state) => ({ wizard: { ...state.wizard, ...updates } })),
  resetWizard: () => set({ wizard: { ...DEFAULT_WIZARD_STATE } }),

  aiGenerateDraft: async (purpose, tone) => {
    set({ isGenerating: true });
    try {
      const result = await communicationApi.aiGenerateDraft({ purpose, tone });
      set({ isGenerating: false });
      return { subject: result.subject, body: result.body };
    } catch {
      set({ isGenerating: false });
      throw new Error('AI generation failed');
    }
  },

  aiSuggestSubjects: async (body) => {
    set({ isGenerating: true });
    try {
      const result = await communicationApi.aiSuggestSubject({ body });
      set({ isGenerating: false });
      return result.subjects || [];
    } catch {
      set({ isGenerating: false });
      return [];
    }
  },

  aiImproveTone: async (body, tone) => {
    set({ isGenerating: true });
    try {
      const result = await communicationApi.aiImproveTone({ body, targetTone: tone });
      set({ isGenerating: false });
      return result.body;
    } catch {
      set({ isGenerating: false });
      return body;
    }
  },
}));
