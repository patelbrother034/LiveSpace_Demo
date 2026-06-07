import { RoomType } from './enums/room-type.enum';

export interface Room {
  id: string;
  floorId: string;
  buildingId: string;
  propertyId: string;
  roomNumber: string;
  type: RoomType;
  sharingType: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  amenities: string[];
  monthlyRent: number;
  securityDeposit: number;
  status: string;
}