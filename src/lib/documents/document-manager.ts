/**
 * HealthShield - Document Management System
 *
 * Comprehensive document organization for:
 * - Tax documents & receipts
 * - Insurance documents
 * - Service records
 * - Customer contracts
 * - Agent certifications
 * - Business licenses
 */

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags: string[];
  metadata: DocumentMetadata;
  isArchived: boolean;
}

export type DocumentType =
  | 'receipt'
  | 'invoice'
  | 'contract'
  | 'license'
  | 'insurance'
  | 'maintenance'
  | 'certification'
  | 'tax_form'
  | 'photo'
  | 'other';

export type DocumentCategory =
  | 'tax_deductible'
  | 'insurance'
  | 'legal'
  | 'operations'
  | 'hr'
  | 'marketing'
  | 'customer'
  | 'service_records';

export interface DocumentMetadata {
  amount?: number;
  vendor?: string;
  serviceSlug?: string;
  agentId?: string;
  taxYear?: number;
  taxCategory?: TaxCategory;
  notes?: string;
}

export type TaxCategory =
  | 'fuel'
  | 'maintenance'
  | 'insurance'
  | 'marketing'
  | 'equipment'
  | 'professional_services'
  | 'office_supplies'
  | 'software'
  | 'travel'
  | 'meals_entertainment'
  | 'wages'
  | 'utilities'
  | 'rent'
  | 'other';

export interface DocumentFolder {
  id: string;
  name: string;
  category: DocumentCategory;
  icon: string;
  description: string;
  documentCount: number;
  totalSize: number;
}

export interface TaxSummary {
  year: number;
  totalIncome: number;
  totalDeductions: number;
  byCategory: Record<TaxCategory, number>;
  documentCount: number;
  estimatedTaxSavings: number;
}

// Pre-defined folder structure
export const documentFolders: DocumentFolder[] = [
  {
    id: 'tax-receipts',
    name: 'Tax Receipts',
    category: 'tax_deductible',
    icon: '📄',
    description: 'All tax-deductible receipts organized by category',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'insurance',
    name: 'Insurance Documents',
    category: 'insurance',
    icon: '🛡️',
    description: 'Health insurance, liability, and compliance policies',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'service-records',
    name: 'Service Records',
    category: 'service_records',
    icon: '📋',
    description: 'Consultation logs, service records, and audit trails',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'legal',
    name: 'Legal Documents',
    category: 'legal',
    icon: '⚖️',
    description: 'Business licenses, permits, and contracts',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'agent-records',
    name: 'Agent Records',
    category: 'hr',
    icon: '👨‍✈️',
    description: 'Agent certifications, licenses, and employment docs',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'customer-contracts',
    name: 'Customer Contracts',
    category: 'customer',
    icon: '📝',
    description: 'Enrollment agreements and consent forms',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'marketing',
    name: 'Marketing Assets',
    category: 'marketing',
    icon: '📸',
    description: 'Photos, videos, and promotional materials',
    documentCount: 0,
    totalSize: 0,
  },
];

// Tax categories with deduction info
export const taxCategories: {
  category: TaxCategory;
  name: string;
  description: string;
  deductionRate: number;
  examples: string[];
}[] = [
  {
    category: 'fuel',
    name: 'Fuel & Gas',
    description: 'Operational fuel and transportation costs',
    deductionRate: 100,
    examples: ['Transportation receipts', 'Office supply purchases'],
  },
  {
    category: 'maintenance',
    name: 'Office Maintenance',
    description: 'Repairs, cleaning, and upkeep',
    deductionRate: 100,
    examples: ['Office repairs', 'Equipment servicing', 'Parts replacement'],
  },
  {
    category: 'insurance',
    name: 'Insurance',
    description: 'Business and professional insurance premiums',
    deductionRate: 100,
    examples: ['E&O insurance', 'Liability insurance', 'Workers comp'],
  },
  {
    category: 'marketing',
    name: 'Marketing & Advertising',
    description: 'Promotional expenses',
    deductionRate: 100,
    examples: ['Facebook ads', 'Google ads', 'Photography', 'Website'],
  },
  {
    category: 'equipment',
    name: 'Equipment',
    description: 'Business equipment and supplies',
    deductionRate: 100,
    examples: ['Computers', 'Monitors', 'Headsets', 'Office furniture'],
  },
  {
    category: 'professional_services',
    name: 'Professional Services',
    description: 'Accounting, legal, and consulting fees',
    deductionRate: 100,
    examples: ['CPA fees', 'Legal fees', 'Business consulting'],
  },
  {
    category: 'software',
    name: 'Software & Subscriptions',
    description: 'Business software and online services',
    deductionRate: 100,
    examples: ['CRM subscription', 'Booking software', 'Accounting software'],
  },
  {
    category: 'meals_entertainment',
    name: 'Meals & Entertainment',
    description: 'Business meals and client entertainment',
    deductionRate: 50,
    examples: ['Client dinners', 'Team meals', 'Business lunches'],
  },
  {
    category: 'wages',
    name: 'Wages & Contractors',
    description: 'Agent wages and contractor payments',
    deductionRate: 100,
    examples: ['Agent pay', 'Cleaning crew', 'Photographer'],
  },
  {
    category: 'utilities',
    name: 'Utilities',
    description: 'Phone, internet, and business utilities',
    deductionRate: 100,
    examples: ['Business phone', 'Internet', 'Dock utilities'],
  },
];

// Sample documents for demo
export const sampleDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Office Supply Receipt - June 2024',
    type: 'receipt',
    category: 'tax_deductible',
    fileUrl: '/documents/fuel-receipt-june.pdf',
    fileSize: 125000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15'),
    tags: ['fuel', '2024', 'june'],
    metadata: {
      amount: 485.50,
      vendor: 'Office Depot',
      taxYear: 2024,
      taxCategory: 'fuel',
    },
    isArchived: false,
  },
  {
    id: 'doc-002',
    name: 'Business Insurance Policy - 2024',
    type: 'insurance',
    category: 'insurance',
    fileUrl: '/documents/insurance-2024.pdf',
    fileSize: 2500000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    expiresAt: new Date('2024-12-31'),
    tags: ['insurance', '2024', 'annual'],
    metadata: {
      amount: 18500,
      vendor: 'Business Insurance Co',
      taxYear: 2024,
      taxCategory: 'insurance',
    },
    isArchived: false,
  },
  {
    id: 'doc-003',
    name: 'Office HVAC Service',
    type: 'maintenance',
    category: 'service_records',
    fileUrl: '/documents/office-hvac-service.pdf',
    fileSize: 350000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-05-20'),
    tags: ['maintenance', 'office', 'hvac'],
    metadata: {
      amount: 1250,
      vendor: 'Austin Office Services',
      serviceSlug: 'office-maintenance',
      taxYear: 2024,
      taxCategory: 'maintenance',
    },
    isArchived: false,
  },
  {
    id: 'doc-004',
    name: 'Agent Insurance License',
    type: 'certification',
    category: 'hr',
    fileUrl: '/documents/agent-insurance-license.pdf',
    fileSize: 180000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    expiresAt: new Date('2026-02-01'),
    tags: ['license', 'agent', 'insurance'],
    metadata: {
      agentId: 'agent-001',
      notes: 'State Licensed Insurance Agent',
    },
    isArchived: false,
  },
];

// Document management functions
export function calculateTaxSummary(documents: Document[], year: number): TaxSummary {
  const taxDocs = documents.filter(
    (d) => d.metadata.taxYear === year && d.metadata.taxCategory
  );

  const byCategory: Record<TaxCategory, number> = {
    fuel: 0,
    maintenance: 0,
    insurance: 0,
    marketing: 0,
    equipment: 0,
    professional_services: 0,
    office_supplies: 0,
    software: 0,
    travel: 0,
    meals_entertainment: 0,
    wages: 0,
    utilities: 0,
    rent: 0,
    other: 0,
  };

  let totalDeductions = 0;

  for (const doc of taxDocs) {
    if (doc.metadata.taxCategory && doc.metadata.amount) {
      const category = doc.metadata.taxCategory;
      const categoryInfo = taxCategories.find((c) => c.category === category);
      const deductionRate = categoryInfo?.deductionRate ?? 100;
      const deductibleAmount = (doc.metadata.amount * deductionRate) / 100;

      byCategory[category] += deductibleAmount;
      totalDeductions += deductibleAmount;
    }
  }

  // Estimate tax savings at 25% marginal rate
  const estimatedTaxSavings = totalDeductions * 0.25;

  return {
    year,
    totalIncome: 193000, // Would come from bookings
    totalDeductions,
    byCategory,
    documentCount: taxDocs.length,
    estimatedTaxSavings,
  };
}

export function getExpiringDocuments(documents: Document[], daysAhead: number = 30): Document[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return documents.filter((d) => {
    if (!d.expiresAt) return false;
    return d.expiresAt >= now && d.expiresAt <= futureDate;
  });
}

export function searchDocuments(
  documents: Document[],
  query: string,
  filters?: {
    type?: DocumentType;
    category?: DocumentCategory;
    year?: number;
  }
): Document[] {
  const queryLower = query.toLowerCase();

  return documents.filter((doc) => {
    // Text search
    const matchesQuery =
      doc.name.toLowerCase().includes(queryLower) ||
      doc.tags.some((t) => t.toLowerCase().includes(queryLower)) ||
      doc.metadata.vendor?.toLowerCase().includes(queryLower);

    // Filters
    const matchesType = !filters?.type || doc.type === filters.type;
    const matchesCategory = !filters?.category || doc.category === filters.category;
    const matchesYear = !filters?.year || doc.metadata.taxYear === filters.year;

    return matchesQuery && matchesType && matchesCategory && matchesYear;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDocumentIcon(type: DocumentType): string {
  const icons: Record<DocumentType, string> = {
    receipt: '🧾',
    invoice: '📑',
    contract: '📄',
    license: '🪪',
    insurance: '🛡️',
    maintenance: '🔧',
    certification: '📜',
    tax_form: '📋',
    photo: '📸',
    other: '📎',
  };
  return icons[type] || '📎';
}
