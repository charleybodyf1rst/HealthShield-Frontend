// Fleet Management Types for Boat Rental CRM

export type BoatLocation = 'lake-travis';
export type BoatStatus = 'available' | 'in-use' | 'maintenance' | 'out-of-service';
export type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'upgrade';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type DocumentType = 'registration' | 'insurance' | 'inspection' | 'maintenance' | 'license';

export interface FleetBoat {
  id: string;
  name: string;
  slug: string;
  type: string;
  deckType: 'single' | 'double';
  capacity: number;
  location: BoatLocation;
  marina: string;
  slipNumber: string;
  status: BoatStatus;
  fuelLevel: number;
  photo: string;
  features: string[];
  startingPrice: number;
  color: 'yellow' | 'pink' | 'blue';

  // Maintenance tracking
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceNotes?: string;

  // Assignment
  currentAgentId?: string;
  currentBookingId?: string;

  // Documents
  documents: FleetDocument[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface FleetDocument {
  id: string;
  boatId: string;
  type: DocumentType;
  name: string;
  description?: string;
  fileUrl: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'valid' | 'expiring-soon' | 'expired';
  uploadedBy?: string;
  uploadedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  boatId: string;
  boatName?: string;
  type: MaintenanceType;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Scheduling
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration?: number; // hours
  actualDuration?: number;

  // Costs
  estimatedCost?: number;
  actualCost?: number;
  parts?: MaintenancePart[];

  // Assignment
  assignedTo?: string;
  performedBy?: string;

  // Documentation
  notes?: string;
  photos?: string[];
  workOrderNumber?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
}

export interface FleetStats {
  totalBoats: number;
  availableBoats: number;
  inUseBoats: number;
  maintenanceBoats: number;
  outOfServiceBoats: number;

  byLocation: {
    lakeTravis: number;
  };

  upcomingMaintenance: number;
  expiringDocuments: number;
  averageFuelLevel: number;
}

// API Request/Response Types
export interface FleetFilters {
  status?: BoatStatus;
  location?: BoatLocation;
  search?: string;
  sort?: 'name' | 'capacity' | 'status' | 'location' | 'fuelLevel';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface CreateMaintenanceData {
  boatId: string;
  type: MaintenanceType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateBoatStatusData {
  status: BoatStatus;
  notes?: string;
  reason?: string;
}
