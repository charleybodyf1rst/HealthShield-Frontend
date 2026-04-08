// Employee/Staff Management Types for HealthShield CRM

export type EmployeeRole = 'agent' | 'crew' | 'admin' | 'manager' | 'dispatcher';
export type EmployeeType = 'employee' | 'subcontractor';
export type EmployeeStatus = 'active' | 'on-leave' | 'training' | 'inactive' | 'terminated';
export type CertificationType = 'USCG-OUPV' | 'USCG-Master' | 'CPR-FirstAid' | 'Water-Safety' | 'Insurance-License' | 'Drug-Test' | 'Background-Check';
export type CertificationStatus = 'valid' | 'expiring-soon' | 'expired' | 'pending';

export interface Employee {
  id: string;

  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  dateOfBirth?: string;
  address?: EmployeeAddress;

  // Employment
  role: EmployeeRole;
  type: EmployeeType;
  status: EmployeeStatus;
  hireDate: string;
  terminationDate?: string;
  department?: string;

  // Compensation
  hourlyRate: number;
  overtimeRate?: number;
  paySchedule: 'weekly' | 'biweekly' | 'monthly';
  bankAccount?: BankAccount;

  // Certifications
  certifications: Certification[];

  // Preferences
  preferredLocation?: 'regional' | 'both';
  preferredServices?: string[];
  maxHoursPerWeek?: number;
  availableDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];

  // Emergency Contact
  emergencyContact: EmergencyContact;

  // Performance
  rating?: number;
  totalShifts?: number;
  totalHours?: number;
  totalTips?: number;
  onTimeRate?: number;

  // Notes
  notes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BankAccount {
  bankName: string;
  accountType: 'checking' | 'savings';
  routingNumber: string;
  accountNumber: string; // Last 4 digits only for display
}

export interface Certification {
  id: string;
  employeeId: string;
  type: CertificationType;
  name: string;
  issuingAuthority?: string;
  licenseNumber?: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
  status: CertificationStatus;
  notes?: string;
  reminderSent?: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  serviceId?: string;
  bookingId?: string;

  // Schedule
  date: string;
  startTime: string;
  endTime: string;
  scheduledHours: number;
  actualHours?: number;

  // Status
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  clockInTime?: string;
  clockOutTime?: string;

  // Location
  location: 'regional';
  marina?: string;

  // Compensation
  hourlyRate: number;
  tips?: number;
  bonus?: number;
  totalPay?: number;

  // Notes
  notes?: string;
  customerFeedback?: string;
  customerRating?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  trainingEmployees: number;

  byRole: {
    agents: number;
    crew: number;
    admin: number;
    managers: number;
    dispatchers: number;
  };

  byType: {
    employees: number;
    subcontractors: number;
  };

  expiringCertifications: number;
  expiredCertifications: number;
  averageRating: number;
  totalScheduledShifts: number;
}

// API Request/Response Types
export interface EmployeeFilters {
  status?: EmployeeStatus;
  role?: EmployeeRole;
  type?: EmployeeType;
  location?: 'regional';
  search?: string;
  certificationStatus?: CertificationStatus;
  sort?: 'name' | 'hireDate' | 'rating' | 'role' | 'status';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  type: EmployeeType;
  hireDate: string;
  hourlyRate: number;
  emergencyContact: EmergencyContact;
  preferredLocation?: 'regional' | 'both';
  notes?: string;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  hourlyRate?: number;
  overtimeRate?: number;
  preferredLocation?: 'regional' | 'both';
  preferredServices?: string[];
  maxHoursPerWeek?: number;
  availableDays?: string[];
  notes?: string;
}

export interface AddCertificationData {
  type: CertificationType;
  name: string;
  issuingAuthority?: string;
  licenseNumber?: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
  notes?: string;
}
