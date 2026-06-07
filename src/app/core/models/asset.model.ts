export interface Asset {
  id: string;
  orgId: string;
  propertyId: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  name: string;
  category: 'Fan' | 'AC' | 'Geyser' | 'Bed' | 'Mattress' | 'Furniture' | 'Appliance' | 'Other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: 'Good' | 'Fair' | 'Poor' | 'Replaced';
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  maintenanceCount: number;
  depreciatedValue?: number;
  status: 'Active' | 'InRepair' | 'Retired' | 'Disposed';
  notes?: string;
  createdAt: string;
}