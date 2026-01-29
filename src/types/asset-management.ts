// Asset Management Types for NDR Platform

// =============================================
// ASSET ENTITY
// =============================================

export type AssetType = 
  | 'server' 
  | 'workstation' 
  | 'network_device' 
  | 'iot' 
  | 'mobile' 
  | 'virtual_machine' 
  | 'container' 
  | 'cloud_instance'
  | 'unknown';

export type AssetRole = 
  | 'domain_controller'
  | 'dns_server'
  | 'web_server'
  | 'database_server'
  | 'file_server'
  | 'mail_server'
  | 'application_server'
  | 'proxy_server'
  | 'firewall'
  | 'router'
  | 'switch'
  | 'load_balancer'
  | 'endpoint'
  | 'scanner'
  | 'other';

export type Locality = 
  | 'internal' 
  | 'external' 
  | 'dmz' 
  | 'cloud' 
  | 'partner' 
  | 'guest';

export type Criticality = 
  | 'critical' 
  | 'high' 
  | 'medium' 
  | 'low';

export type AssetStatus = 
  | 'active' 
  | 'stale' 
  | 'decommissioned' 
  | 'unknown';

export interface AssetIdentity {
  hostname: string;
  fqdn?: string;
  ipv4Addresses: string[];
  ipv6Addresses: string[];
  macAddresses: string[];
  fingerprint?: string;
}

export interface AssetMetadata {
  owner?: string;
  businessUnit?: string;
  site?: string;
  environment?: string; // prod, staging, dev
  tags: string[];
  customFields?: Record<string, string>;
}

export interface AssetLifecycle {
  firstSeen: string;
  lastSeen: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AssetExposure {
  hasPublicIP: boolean;
  publicIPs?: string[];
  hasInboundInternet: boolean;
  isNATed: boolean;
  exposedPorts?: number[];
}

export interface Asset {
  id: string;
  identity: AssetIdentity;
  type: AssetType;
  role: AssetRole;
  locality: Locality;
  criticality: Criticality;
  exposure: AssetExposure;
  metadata: AssetMetadata;
  lifecycle: AssetLifecycle;
  groupIds: string[];
  notes?: string;
}

// =============================================
// ASSET GROUP ENTITY
// =============================================

export type GroupType = 'static' | 'dynamic';

export interface DynamicGroupRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'cidr_match';
  value: string | string[];
}

export interface GroupOptions {
  enableBaselining: boolean;
  disableSecurityEventsExcludedServices: boolean;
  disableFloodAlarms: boolean;
  trapUnusedAddresses: boolean;
}

export interface AssetGroup {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  parentId?: string;
  priority: number;
  rules?: DynamicGroupRule[];
  ipRanges?: string[];
  options: GroupOptions;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  isDefault?: boolean;
}

// =============================================
// NETWORK LOCALITY ENTITY
// =============================================

export interface NetworkLocality {
  id: string;
  name: string;
  type: 'internal' | 'external';
  cidrBlocks: string[];
  description?: string;
  site?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// TRUST / ALLOW LIST ENTITIES
// =============================================

export type TrustType = 'asset' | 'domain' | 'scanner' | 'ip_range';

export interface TrustEntry {
  id: string;
  type: TrustType;
  value: string; // IP, hostname, domain, or CIDR
  scope: 'global' | 'detection' | 'group';
  scopeValue?: string; // detection ID or group ID
  reason: string;
  affectedDetections?: string[];
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  isActive: boolean;
}

// =============================================
// AUDIT TRAIL
// =============================================

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'import' 
  | 'export' 
  | 'approve' 
  | 'reject';

export type AuditEntityType = 
  | 'asset' 
  | 'group' 
  | 'locality' 
  | 'trust_entry';

export interface AuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId: string;
  userName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  ipAddress?: string;
}

// =============================================
// RBAC
// =============================================

export type UserRole = 
  | 'admin' 
  | 'security_admin' 
  | 'operator' 
  | 'read_only';

export interface Permission {
  canCreateAssets: boolean;
  canEditAssets: boolean;
  canDeleteAssets: boolean;
  canManageGroups: boolean;
  canManageTrustLists: boolean;
  canManageLocalities: boolean;
  canViewAuditLog: boolean;
  canExport: boolean;
  canImport: boolean;
  requiresApproval: boolean;
}

export const RolePermissions: Record<UserRole, Permission> = {
  admin: {
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: true,
    canManageGroups: true,
    canManageTrustLists: true,
    canManageLocalities: true,
    canViewAuditLog: true,
    canExport: true,
    canImport: true,
    requiresApproval: false,
  },
  security_admin: {
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: false,
    canManageGroups: true,
    canManageTrustLists: true,
    canManageLocalities: true,
    canViewAuditLog: true,
    canExport: true,
    canImport: true,
    requiresApproval: false,
  },
  operator: {
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: false,
    canManageGroups: false,
    canManageTrustLists: false,
    canManageLocalities: false,
    canViewAuditLog: false,
    canExport: true,
    canImport: false,
    requiresApproval: true,
  },
  read_only: {
    canCreateAssets: false,
    canEditAssets: false,
    canDeleteAssets: false,
    canManageGroups: false,
    canManageTrustLists: false,
    canManageLocalities: false,
    canViewAuditLog: true,
    canExport: true,
    canImport: false,
    requiresApproval: false,
  },
};
