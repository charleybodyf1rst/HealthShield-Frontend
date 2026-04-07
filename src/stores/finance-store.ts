'use client';

import { create } from 'zustand';
import { financeApi } from '@/lib/api';

interface FinanceStore {
  // Invoices
  invoices: any[];
  invoicesLoading: boolean;
  // Expenses
  expenses: any[];
  expensesLoading: boolean;
  // Payments
  payments: any[];
  paymentsLoading: boolean;
  // Payroll
  payroll: any[];
  payrollLoading: boolean;
  // Metrics
  metrics: any | null;
  metricsLoading: boolean;
  // Error
  error: string | null;
  // Actions
  fetchInvoices: (params?: Record<string, string>) => Promise<void>;
  createInvoice: (data: Record<string, any>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  fetchExpenses: (params?: Record<string, string>) => Promise<void>;
  createExpense: (data: Record<string, any>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  fetchPayments: (params?: Record<string, string>) => Promise<void>;
  createPayment: (data: Record<string, any>) => Promise<void>;
  fetchPayroll: (params?: Record<string, string>) => Promise<void>;
  createPayrollEntry: (data: Record<string, any>) => Promise<void>;
  createPayroll: (data: Record<string, any>) => Promise<void>;
  deletePayrollEntry: (id: string) => Promise<void>;
  deletePayroll: (id: string) => Promise<void>;
  fetchMetrics: () => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  // Initial state
  invoices: [],
  invoicesLoading: false,
  expenses: [],
  expensesLoading: false,
  payments: [],
  paymentsLoading: false,
  payroll: [],
  payrollLoading: false,
  metrics: null,
  metricsLoading: false,
  error: null,

  // Invoices
  fetchInvoices: async (params?: Record<string, string>) => {
    set({ invoicesLoading: true, error: null });
    try {
      const response = await financeApi.getInvoices(params);
      set({ invoices: response.data?.invoices || response.data || [], invoicesLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch invoices';
      set({ error: message, invoicesLoading: false });
    }
  },

  createInvoice: async (data: Record<string, any>) => {
    set({ invoicesLoading: true, error: null });
    try {
      await financeApi.createInvoice(data);
      await get().fetchInvoices();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create invoice';
      set({ error: message, invoicesLoading: false });
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    set({ invoicesLoading: true, error: null });
    try {
      await financeApi.deleteInvoice(id);
      await get().fetchInvoices();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete invoice';
      set({ error: message, invoicesLoading: false });
      throw error;
    }
  },

  // Expenses
  fetchExpenses: async (params?: Record<string, string>) => {
    set({ expensesLoading: true, error: null });
    try {
      const response = await financeApi.getExpenses(params);
      set({ expenses: response.data?.expenses || response.data || [], expensesLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
      set({ error: message, expensesLoading: false });
    }
  },

  createExpense: async (data: Record<string, any>) => {
    set({ expensesLoading: true, error: null });
    try {
      await financeApi.createExpense(data);
      await get().fetchExpenses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create expense';
      set({ error: message, expensesLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    set({ expensesLoading: true, error: null });
    try {
      await financeApi.deleteExpense(id);
      await get().fetchExpenses();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete expense';
      set({ error: message, expensesLoading: false });
      throw error;
    }
  },

  // Payments
  fetchPayments: async (params?: Record<string, string>) => {
    set({ paymentsLoading: true, error: null });
    try {
      const response = await financeApi.getPayments(params);
      set({ payments: response.data?.payments || response.data || [], paymentsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch payments';
      set({ error: message, paymentsLoading: false });
    }
  },

  createPayment: async (data: Record<string, any>) => {
    set({ paymentsLoading: true, error: null });
    try {
      await financeApi.createPayment(data);
      await get().fetchPayments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create payment';
      set({ error: message, paymentsLoading: false });
      throw error;
    }
  },

  // Payroll
  fetchPayroll: async (params?: Record<string, string>) => {
    set({ payrollLoading: true, error: null });
    try {
      const response = await financeApi.getPayroll(params);
      set({ payroll: response.data?.payroll || response.data || [], payrollLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch payroll';
      set({ error: message, payrollLoading: false });
    }
  },

  createPayrollEntry: async (data: Record<string, any>) => {
    set({ payrollLoading: true, error: null });
    try {
      await financeApi.createPayroll(data);
      await get().fetchPayroll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create payroll entry';
      set({ error: message, payrollLoading: false });
      throw error;
    }
  },

  deletePayrollEntry: async (id: string) => {
    set({ payrollLoading: true, error: null });
    try {
      await financeApi.deletePayroll(id);
      await get().fetchPayroll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete payroll entry';
      set({ error: message, payrollLoading: false });
      throw error;
    }
  },

  // Aliases for page compatibility
  createPayroll: async (data: Record<string, any>) => { return get().createPayrollEntry(data); },
  deletePayroll: async (id: string) => { return get().deletePayrollEntry(id); },

  // Metrics
  fetchMetrics: async () => {
    set({ metricsLoading: true, error: null });
    try {
      const response = await financeApi.getMetrics();
      set({ metrics: response.data || response, metricsLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
      set({ error: message, metricsLoading: false });
    }
  },
}));

// Selector hooks
export const useInvoices = () => useFinanceStore((state) => state.invoices);
export const useExpenses = () => useFinanceStore((state) => state.expenses);
export const usePayments = () => useFinanceStore((state) => state.payments);
export const usePayroll = () => useFinanceStore((state) => state.payroll);
export const useFinanceMetrics = () => useFinanceStore((state) => state.metrics);
export const useFinanceError = () => useFinanceStore((state) => state.error);
