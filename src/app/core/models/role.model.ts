export interface Permission {
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve')[];
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
}