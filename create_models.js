const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/app/core/models');
const enumsDir = path.join(modelsDir, 'enums');

// Ensure directories exist
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
if (!fs.existsSync(enumsDir)) fs.mkdirSync(enumsDir, { recursive: true });

const enums = {
    'bed-status.enum.ts': `export enum BedStatus { Occupied = 'Occupied', Vacant = 'Vacant', Reserved = 'Reserved', Maintenance = 'Maintenance', Blocked = 'Blocked' }`,
    'payment-status.enum.ts': `export enum PaymentStatus { Paid = 'Paid', Pending = 'Pending', Overdue = 'Overdue', Partial = 'Partial' }`,
    'ticket-status.enum.ts': `export enum TicketStatus { Open = 'Open', Assigned = 'Assigned', InProgress = 'InProgress', Resolved = 'Resolved', Closed = 'Closed' }`,
    'tenant-status.enum.ts': `export enum TenantStatus { Active = 'Active', CheckedOut = 'CheckedOut', Renewal = 'Renewal', Notice = 'Notice' }`,
    'room-type.enum.ts': `export enum RoomType { Single = 'Single', Double = 'Double', Triple = 'Triple', Dormitory = 'Dormitory' }`,
    'property-type.enum.ts': `export enum PropertyType { PG = 'PG', Hostel = 'Hostel', CoLiving = 'CoLiving', StudentHousing = 'StudentHousing' }`,
    'user-role.enum.ts': `export enum UserRole { Owner = 'Owner', Tenant = 'Tenant', Parent = 'Parent', Caretaker = 'Caretaker', Warden = 'Warden', Accountant = 'Accountant', SuperAdmin = 'SuperAdmin', Enterprise = 'Enterprise' }`,
    'gender.enum.ts': `export enum Gender { Male = 'Male', Female = 'Female', Unisex = 'Unisex' }`,
    'payment-mode.enum.ts': `export enum PaymentMode { UPI = 'UPI', Cash = 'Cash', BankTransfer = 'BankTransfer', Card = 'Card', Wallet = 'Wallet' }`
};

for (const [filename, content] of Object.entries(enums)) {
    fs.writeFileSync(path.join(enumsDir, filename), content);
}

const models = {
    'organization.model.ts': `export interface Organization {
  id: string;
  name: string;
  legalName: string;
  gstin?: string;
  pan?: string;
  address: any;
  contactPerson: string;
  phone: string;
  email: string;
  logo?: string;
  subscriptionId: string;
  createdAt: string;
  status: string;
  settings: any;
}`,
    'property.model.ts': `import { PropertyType } from './enums/property-type.enum';
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
}`,
    'building.model.ts': `export interface Building {
  id: string;
  propertyId: string;
  name: string;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  constructionYear: number;
  status: string;
}`,
    'floor.model.ts': `export interface Floor {
  id: string;
  buildingId: string;
  propertyId: string;
  name: string;
  floorNumber: number;
  totalRooms: number;
  totalBeds: number;
}`,
    'room.model.ts': `import { RoomType } from './enums/room-type.enum';

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
}`,
    'bed.model.ts': `import { BedStatus } from './enums/bed-status.enum';

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
}`,
    'tenant.model.ts': `import { Gender } from './enums/gender.enum';
import { TenantStatus } from './enums/tenant-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';

export interface Tenant {
  id: string;
  orgId: string;
  propertyId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  phone: string;
  email: string;
  occupation: string;
  collegeName?: string;
  permanentAddress: any;
  aadhaarNumber?: string;
  panNumber?: string;
  kycStatus: string;
  kycDocuments: any[];
  photo?: string;
  parentId?: string;
  emergencyContact: any;
  monthlyRent: number;
  securityDeposit: number;
  depositPaid: boolean;
  rentDueDate: number;
  leaseStartDate: string;
  leaseEndDate: string;
  checkInDate: string;
  checkOutDate: string | null;
  status: TenantStatus;
  paymentStatus: PaymentStatus;
  totalPaid: number;
  pendingDues: number;
  createdAt: string;
}`,
    'parent.model.ts': `export interface Parent {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  relation: string;
  phone: string;
  email: string;
  address: any;
  portalAccess: boolean;
  createdAt: string;
}`,
    'transaction.model.ts': `import { PaymentMode } from './enums/payment-mode.enum';
import { PaymentStatus } from './enums/payment-status.enum';

export interface Transaction {
  id: string;
  orgId: string;
  propertyId: string;
  tenantId: string;
  type: string; // RENT, DEPOSIT, EXPENSE, etc.
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  dueDate?: string;
  receiptNumber?: string;
  invoiceId?: string;
  description: string;
  status: PaymentStatus;
  recordedBy?: string;
  createdAt: string;
}`,
    'ticket.model.ts': `import { TicketStatus } from './enums/ticket-status.enum';

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
}`,
    'user.model.ts': `import { UserRole } from './enums/user-role.enum';

export interface User {
  id: string;
  orgId?: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  avatar?: string | null;
  propertyAccess?: string[];
  linkedTenantId?: string;
  linkedParentId?: string;
  linkedPropertyId?: string;
  lastLogin?: string;
}`
};

// Also generate some missing mock models briefly
const extraModels = ['staff.model.ts', 'visitor.model.ts', 'announcement.model.ts', 'invoice.model.ts', 'receipt.model.ts', 'expense.model.ts', 'gate-pass.model.ts', 'asset.model.ts', 'subscription.model.ts', 'audit-log.model.ts', 'notification.model.ts', 'role.model.ts'];

for (const extra of extraModels) {
    if (!models[extra]) {
        models[extra] = `export interface ${extra.split('.')[0].replace(/-./g, x => x[1].toUpperCase()).replace(/^./, x => x.toUpperCase())} {\n  id: string;\n  [key: string]: any;\n}`;
    }
}

for (const [filename, content] of Object.entries(models)) {
    fs.writeFileSync(path.join(modelsDir, filename), content);
}

console.log('Successfully created all models and enums');
