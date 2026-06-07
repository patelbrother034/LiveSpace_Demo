import { TicketStatus } from './enums/ticket-status.enum';

export interface Ticket {
  id: string;
  orgId: string;
  propertyId: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  bedId?: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  status: TicketStatus;
  photos: string[];
  timeline: any[];
  estimatedCost?: number;
  actualCost?: number;
  resolution?: string;
  satisfactionRating?: number;
  createdAt: string;
  resolvedAt?: string;
}