export interface InsuranceProgram {
  id: string;
  name: string;
  type: 'individual' | 'family' | 'medicare_advantage' | 'medicare_supplement' | 'group' | 'dental_vision' | 'short_term' | 'life';
  description: string;
  premium: number;
  deductible: number;
  copay: number;
  coverage: string[];
  isActive: boolean;
  enrollmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  programId: string;
  programName?: string;
  leadId: string;
  leadName?: string;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  premium: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  leadName?: string;
  programs: InsuranceProgram[];
  totalPremium: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WellnessMetric {
  id: string;
  programId: string;
  metricName: string;
  value: number;
  unit: string;
  period: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface SavingsCalculation {
  currentPremium: number;
  projectedSavings: number;
  recommendedPlan: string;
  breakdown: Record<string, number>;
}

export interface InsuranceStats {
  totalPrograms: number;
  activeEnrollments: number;
  totalProposals: number;
  conversionRate: number;
  averagePremium: number;
  totalRevenue: number;
  claimsProcessed: number;
  wellnessScore: number;
}

export interface PolicyVerification {
  policyNumber: string;
  holderName: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  coverageType: string;
  effectiveDate: string;
  expirationDate: string;
}
