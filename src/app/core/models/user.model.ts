import { UserRole } from './enums/user-role.enum';

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
}