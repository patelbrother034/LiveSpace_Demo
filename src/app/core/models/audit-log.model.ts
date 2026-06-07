export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  ipAddress?: string;
  timestamp: string;
}