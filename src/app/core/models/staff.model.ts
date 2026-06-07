import { Gender } from './enums/gender.enum';

export interface Staff {
  id: string;
  orgId: string;
  propertyId: string;
  name: string;
  gender: Gender;
  phone: string;
  email?: string;
  role: 'Caretaker' | 'Warden' | 'Cook' | 'Cleaner' | 'Watchman' | 'Electrician' | 'Plumber' | 'Manager' | 'Other';
  designation?: string;
  department?: string;
  dateOfJoining: string;
  salary: number;
  aadhaarNumber?: string;
  address?: string;
  photo?: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  isActive: boolean;
  attendanceRate?: number;
  performanceRating?: number;
  createdAt: string;
}