import { BedStatus } from './enums/bed-status.enum';

export interface Bed {
  id: string;
  roomId: string;
  floorId: string;
  buildingId: string;
  propertyId: string;
  bedNumber: string;
  position: string;
  tenantId: string | null;
  monthlyRent: number;
  securityDeposit: number;
  status: BedStatus;
  lastStatusChange: string;
}