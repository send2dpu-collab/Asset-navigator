import { cn } from '@/lib/utils';
import { 
  Shield, 
  Server, 
  Monitor, 
  Wifi, 
  Smartphone, 
  Cloud, 
  Box, 
  HelpCircle,
  Globe,
  Database,
  Mail,
  HardDrive,
  Router,
  Layers,
  ScanLine
} from 'lucide-react';
import { AssetType, AssetRole, Locality, Criticality, AssetStatus } from '@/types/asset-management';

interface CriticalityBadgeProps {
  criticality: Criticality;
  className?: string;
}

export function CriticalityBadge({ criticality, className }: CriticalityBadgeProps) {
  const variants: Record<Criticality, string> = {
    critical: 'bg-critical/20 text-critical border-critical/30',
    high: 'bg-high/20 text-high border-high/30',
    medium: 'bg-medium/20 text-medium border-medium/30',
    low: 'bg-low/20 text-low border-low/30',
  };

  const labels: Record<Criticality, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border',
      variants[criticality],
      className
    )}>
      {labels[criticality]}
    </span>
  );
}

interface LocalityBadgeProps {
  locality: Locality;
  className?: string;
}

export function LocalityBadge({ locality, className }: LocalityBadgeProps) {
  const variants: Record<Locality, string> = {
    internal: 'bg-internal/15 text-internal border-internal/30',
    external: 'bg-external/15 text-external border-external/30',
    dmz: 'bg-dmz/15 text-dmz border-dmz/30',
    cloud: 'bg-cloud/15 text-cloud border-cloud/30',
    partner: 'bg-partner/15 text-partner border-partner/30',
    guest: 'bg-guest/15 text-guest border-guest/30',
  };

  const labels: Record<Locality, string> = {
    internal: 'Internal',
    external: 'External',
    dmz: 'DMZ',
    cloud: 'Cloud',
    partner: 'Partner',
    guest: 'Guest',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border',
      variants[locality],
      className
    )}>
      {labels[locality]}
    </span>
  );
}

interface StatusIndicatorProps {
  status: AssetStatus;
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({ status, showLabel = false, className }: StatusIndicatorProps) {
  const colors: Record<AssetStatus, string> = {
    active: 'bg-status-active',
    stale: 'bg-status-stale',
    decommissioned: 'bg-muted-foreground',
    unknown: 'bg-muted-foreground',
  };

  const labels: Record<AssetStatus, string> = {
    active: 'Active',
    stale: 'Stale',
    decommissioned: 'Decommissioned',
    unknown: 'Unknown',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('w-2 h-2 rounded-full', colors[status])} />
      {showLabel && <span className="text-sm text-muted-foreground">{labels[status]}</span>}
    </div>
  );
}

interface AssetTypeIconProps {
  type: AssetType;
  className?: string;
}

export function AssetTypeIcon({ type, className }: AssetTypeIconProps) {
  const icons: Record<AssetType, React.ReactNode> = {
    server: <Server className={cn('w-4 h-4', className)} />,
    workstation: <Monitor className={cn('w-4 h-4', className)} />,
    network_device: <Router className={cn('w-4 h-4', className)} />,
    iot: <Wifi className={cn('w-4 h-4', className)} />,
    mobile: <Smartphone className={cn('w-4 h-4', className)} />,
    virtual_machine: <Box className={cn('w-4 h-4', className)} />,
    container: <Layers className={cn('w-4 h-4', className)} />,
    cloud_instance: <Cloud className={cn('w-4 h-4', className)} />,
    unknown: <HelpCircle className={cn('w-4 h-4', className)} />,
  };

  return icons[type] || icons.unknown;
}

interface AssetRoleIconProps {
  role: AssetRole;
  className?: string;
}

export function AssetRoleIcon({ role, className }: AssetRoleIconProps) {
  const icons: Record<AssetRole, React.ReactNode> = {
    domain_controller: <Shield className={cn('w-4 h-4', className)} />,
    dns_server: <Globe className={cn('w-4 h-4', className)} />,
    web_server: <Globe className={cn('w-4 h-4', className)} />,
    database_server: <Database className={cn('w-4 h-4', className)} />,
    file_server: <HardDrive className={cn('w-4 h-4', className)} />,
    mail_server: <Mail className={cn('w-4 h-4', className)} />,
    application_server: <Server className={cn('w-4 h-4', className)} />,
    proxy_server: <Server className={cn('w-4 h-4', className)} />,
    firewall: <Shield className={cn('w-4 h-4', className)} />,
    router: <Router className={cn('w-4 h-4', className)} />,
    switch: <Router className={cn('w-4 h-4', className)} />,
    load_balancer: <Layers className={cn('w-4 h-4', className)} />,
    endpoint: <Monitor className={cn('w-4 h-4', className)} />,
    scanner: <ScanLine className={cn('w-4 h-4', className)} />,
    other: <HelpCircle className={cn('w-4 h-4', className)} />,
  };

  return icons[role] || icons.other;
}

interface ExposureBadgeProps {
  hasPublicIP: boolean;
  hasInboundInternet: boolean;
  className?: string;
}

export function ExposureBadge({ hasPublicIP, hasInboundInternet, className }: ExposureBadgeProps) {
  if (!hasPublicIP && !hasInboundInternet) return null;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded',
      'bg-destructive/20 text-destructive border border-destructive/30',
      className
    )}>
      <Globe className="w-3 h-3" />
      {hasPublicIP ? 'Public IP' : 'Inbound'}
    </span>
  );
}

interface TagBadgeProps {
  tag: string;
  className?: string;
  onRemove?: () => void;
}

export function TagBadge({ tag, className, onRemove }: TagBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground',
      className
    )}>
      {tag}
      {onRemove && (
        <button 
          onClick={onRemove}
          className="hover:text-foreground ml-1"
        >
          ×
        </button>
      )}
    </span>
  );
}
