import { PropertyType } from './enums/property-type.enum';
import { Gender } from './enums/gender.enum';

export interface Property {
  id: string;
  orgId: string;
  name: string;
  type: PropertyType;
  gender: Gender;
  address: any;
  contactPerson: string;
  phone: string;
  email: string;
  totalBuildings: number;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  maintenanceBeds: number;
  noticeBeds: number;
  amenities: string[];
  mealPlan: any;
  curfewTime: string;
  status: string;
  images: string[];
  monthlyRevenue: number;
  createdAt: string;
}