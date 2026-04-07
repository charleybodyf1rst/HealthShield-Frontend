/**
 * HealthShield - Document Management System
 *
 * Comprehensive document organization for:
 * - Tax documents & receipts
 * - Insurance documents
 * - Boat maintenance records
 * - Customer contracts
 * - Captain certifications
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
  | 'boat_records';

export interface DocumentMetadata {
  amount?: number;
  vendor?: string;
  boatSlug?: string;
  captainId?: string;
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
    description: 'Boat insurance, liability, and workers comp policies',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'boat-records',
    name: 'Boat Records',
    category: 'boat_records',
    icon: '🚤',
    description: 'Maintenance logs, registrations, and inspections',
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
    id: 'captain-records',
    name: 'Captain Records',
    category: 'hr',
    icon: '👨‍✈️',
    description: 'Captain certifications, licenses, and employment docs',
    documentCount: 0,
    totalSize: 0,
  },
  {
    id: 'customer-contracts',
    name: 'Customer Contracts',
    category: 'customer',
    icon: '📝',
    description: 'Rental agreements and waivers',
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
    description: 'Marine fuel and gas for boats',
    deductionRate: 100,
    examples: ['Gas station receipts', 'Marina fuel purchases'],
  },
  {
    category: 'maintenance',
    name: 'Boat Maintenance',
    description: 'Repairs, cleaning, and upkeep',
    deductionRate: 100,
    examples: ['Engine repairs', 'Hull cleaning', 'Parts replacement'],
  },
  {
    category: 'insurance',
    name: 'Insurance',
    description: 'Business and boat insurance premiums',
    deductionRate: 100,
    examples: ['Boat insurance', 'Liability insurance', 'Workers comp'],
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
    examples: ['Life jackets', 'Coolers', 'Sound systems', 'Lily pads'],
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
    description: 'Captain wages and contractor payments',
    deductionRate: 100,
    examples: ['Captain pay', 'Cleaning crew', 'Photographer'],
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
    name: 'Marina Fuel Receipt - June 2024',
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
      vendor: 'Highland Lakes Marina',
      taxYear: 2024,
      taxCategory: 'fuel',
    },
    isArchived: false,
  },
  {
    id: 'doc-002',
    name: 'Boat Insurance Policy - 2024',
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
      vendor: 'Marine Insurance Co',
      taxYear: 2024,
      taxCategory: 'insurance',
    },
    isArchived: false,
  },
  {
    id: 'doc-003',
    name: 'King Kong Engine Service',
    type: 'maintenance',
    category: 'boat_records',
    fileUrl: '/documents/king-kong-service.pdf',
    fileSize: 350000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-05-20'),
    tags: ['maintenance', 'king-kong', 'engine'],
    metadata: {
      amount: 1250,
      vendor: 'Austin Marine Services',
      boatSlug: 'king-kong',
      taxYear: 2024,
      taxCategory: 'maintenance',
    },
    isArchived: false,
  },
  {
    id: 'doc-004',
    name: 'Captain Jason License',
    type: 'certification',
    category: 'hr',
    fileUrl: '/documents/captain-jason-license.pdf',
    fileSize: 180000,
    mimeType: 'application/pdf',
    uploadedAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    expiresAt: new Date('2026-02-01'),
    tags: ['license', 'captain', 'uscg'],
    metadata: {
      captainId: 'captain-jason',
      notes: 'USCG Master License - 100 Ton',
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
