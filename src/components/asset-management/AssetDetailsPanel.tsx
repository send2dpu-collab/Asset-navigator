import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Asset, AssetGroup } from '@/types/asset-management';
import { 
  CriticalityBadge, 
  LocalityBadge, 
  StatusIndicator, 
  AssetTypeIcon,
  ExposureBadge,
  TagBadge
} from './AssetBadges';
import { 
  X, 
  Edit2, 
  Save, 
  Trash2,
  Plus,
  Clock,
  User,
  Building,
  MapPin,
  Tag,
  Shield,
  Network,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Criticality, Locality, AssetType, AssetRole } from '@/types/asset-management';

interface AssetDetailsPanelProps {
  asset: Asset | null;
  groups: AssetGroup[];
  isEditing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: (asset: Asset) => void;
  onDelete: () => void;
}

export function AssetDetailsPanel({
  asset,
  groups,
  isEditing,
  onClose,
  onEdit,
  onSave,
  onDelete,
}: AssetDetailsPanelProps) {
  const [editedAsset, setEditedAsset] = useState<Asset | null>(asset);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <Network className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No Asset Selected</p>
        <p className="text-sm text-center mt-2">
          Select an asset from the table to view its details
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const assetGroups = groups.filter(g => asset.groupIds.includes(g.id));

  const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      <span className="text-muted-foreground text-sm w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <AssetTypeIcon type={asset.type} className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">{asset.identity.hostname}</h3>
            <p className="text-xs text-muted-foreground">Asset ID: {asset.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={() => editedAsset && onSave(editedAsset)}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onEdit}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto ndr-scrollbar">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="border-b border-border px-4 flex-shrink-0">
            <TabsList className="h-10 bg-transparent">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="network" className="text-sm">Network</TabsTrigger>
              <TabsTrigger value="groups" className="text-sm">Groups</TabsTrigger>
              <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-4 space-y-6 flex-1 overflow-auto">
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <StatusIndicator status={asset.lifecycle.status} showLabel />
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Criticality</div>
                <CriticalityBadge criticality={asset.criticality} />
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Locality</div>
                <LocalityBadge locality={asset.locality} />
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Exposure</div>
                {asset.exposure.hasPublicIP || asset.exposure.hasInboundInternet ? (
                  <ExposureBadge 
                    hasPublicIP={asset.exposure.hasPublicIP} 
                    hasInboundInternet={asset.exposure.hasInboundInternet} 
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </div>

            {/* Identity */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Identity
              </h4>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <DetailRow label="Hostname">{asset.identity.hostname}</DetailRow>
                {asset.identity.fqdn && (
                  <DetailRow label="FQDN">{asset.identity.fqdn}</DetailRow>
                )}
                <DetailRow label="Type">
                  <span className="capitalize">{asset.type.replace('_', ' ')}</span>
                </DetailRow>
                <DetailRow label="Role">
                  <span className="capitalize">{asset.role.replace('_', ' ')}</span>
                </DetailRow>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Metadata
              </h4>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <DetailRow label="Owner">
                  {asset.metadata.owner || <span className="text-muted-foreground">—</span>}
                </DetailRow>
                <DetailRow label="Business Unit">
                  {asset.metadata.businessUnit || <span className="text-muted-foreground">—</span>}
                </DetailRow>
                <DetailRow label="Site">
                  {asset.metadata.site || <span className="text-muted-foreground">—</span>}
                </DetailRow>
                <DetailRow label="Environment">
                  {asset.metadata.environment ? (
                    <span className="capitalize">{asset.metadata.environment}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailRow>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {asset.metadata.tags.map(tag => (
                  <TagBadge key={tag} tag={tag} />
                ))}
                {asset.metadata.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>

            {/* Lifecycle */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Lifecycle
              </h4>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <DetailRow label="First Seen">{formatDate(asset.lifecycle.firstSeen)}</DetailRow>
                <DetailRow label="Last Seen">{formatDate(asset.lifecycle.lastSeen)}</DetailRow>
                <DetailRow label="Created">{formatDate(asset.lifecycle.createdAt)}</DetailRow>
                <DetailRow label="Updated">{formatDate(asset.lifecycle.updatedAt)}</DetailRow>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="p-4 space-y-6">
            {/* IP Addresses */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">IPv4 Addresses</h4>
              <div className="space-y-2">
                {asset.identity.ipv4Addresses.map(ip => (
                  <div 
                    key={ip}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded font-mono text-sm"
                  >
                    {ip}
                  </div>
                ))}
              </div>
            </div>

            {asset.identity.ipv6Addresses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">IPv6 Addresses</h4>
                <div className="space-y-2">
                  {asset.identity.ipv6Addresses.map(ip => (
                    <div 
                      key={ip}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded font-mono text-sm"
                    >
                      {ip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAC Addresses */}
            {asset.identity.macAddresses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">MAC Addresses</h4>
                <div className="space-y-2">
                  {asset.identity.macAddresses.map(mac => (
                    <div 
                      key={mac}
                      className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded font-mono text-sm"
                    >
                      {mac}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exposure Details */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Exposure</h4>
              <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
                <DetailRow label="Public IP">
                  {asset.exposure.hasPublicIP ? (
                    <span className="text-destructive font-medium">Yes</span>
                  ) : (
                    <span className="text-low">No</span>
                  )}
                </DetailRow>
                {asset.exposure.publicIPs && asset.exposure.publicIPs.length > 0 && (
                  <DetailRow label="Public IPs">
                    <div className="font-mono">
                      {asset.exposure.publicIPs.join(', ')}
                    </div>
                  </DetailRow>
                )}
                <DetailRow label="Inbound Internet">
                  {asset.exposure.hasInboundInternet ? (
                    <span className="text-destructive font-medium">Yes</span>
                  ) : (
                    <span className="text-low">No</span>
                  )}
                </DetailRow>
                <DetailRow label="NAT">
                  {asset.exposure.isNATed ? 'Yes' : 'No'}
                </DetailRow>
                {asset.exposure.exposedPorts && asset.exposure.exposedPorts.length > 0 && (
                  <DetailRow label="Exposed Ports">
                    {asset.exposure.exposedPorts.join(', ')}
                  </DetailRow>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">Member of Groups</h4>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add to Group
              </Button>
            </div>

            <div className="space-y-2">
              {assetGroups.map(group => (
                <div 
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{group.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {group.type === 'dynamic' ? 'Dynamic Group' : 'Static Group'}
                      {group.isDefault && ' • Default'}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-muted-foreground">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {assetGroups.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Not a member of any groups</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-border">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Asset updated</div>
                  <div className="text-xs text-muted-foreground">
                    Criticality changed from Medium to Critical
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    2 days ago by admin@acme.com
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b border-border">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Added to group</div>
                  <div className="text-xs text-muted-foreground">
                    Added to "Critical Infrastructure"
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    1 week ago by security-admin@acme.com
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Asset discovered</div>
                  <div className="text-xs text-muted-foreground">
                    Automatically discovered via network scan
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(asset.lifecycle.firstSeen)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Actions */}
      {!isEditing && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Mark as Trusted
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
