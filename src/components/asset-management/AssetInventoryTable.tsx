import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset-management';
import { 
  CriticalityBadge, 
  LocalityBadge, 
  StatusIndicator, 
  AssetTypeIcon,
  ExposureBadge,
  TagBadge
} from './AssetBadges';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Columns,
  Download,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssetInventoryTableProps {
  assets: Asset[];
  selectedAssetId: string | null;
  selectedAssetIds: string[];
  onSelectAsset: (assetId: string) => void;
  onSelectMultiple: (assetIds: string[]) => void;
  onEditAsset?: (assetId: string) => void;
  onDeleteAsset?: (assetId: string) => void;
}

type SortField = 'hostname' | 'type' | 'locality' | 'criticality' | 'status' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

export function AssetInventoryTable({
  assets,
  selectedAssetId,
  selectedAssetIds,
  onSelectAsset,
  onSelectMultiple,
  onEditAsset,
  onDeleteAsset,
}: AssetInventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('hostname');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      onSelectMultiple([]);
    } else {
      onSelectMultiple(filteredAssets.map(a => a.id));
    }
  };

  const handleToggleSelect = (assetId: string) => {
    if (selectedAssetIds.includes(assetId)) {
      onSelectMultiple(selectedAssetIds.filter(id => id !== assetId));
    } else {
      onSelectMultiple([...selectedAssetIds, assetId]);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const query = searchQuery.toLowerCase();
    return (
      asset.identity.hostname.toLowerCase().includes(query) ||
      asset.identity.ipv4Addresses.some(ip => ip.includes(query)) ||
      asset.metadata.tags.some(tag => tag.toLowerCase().includes(query)) ||
      asset.metadata.owner?.toLowerCase().includes(query)
    );
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'hostname':
        comparison = a.identity.hostname.localeCompare(b.identity.hostname);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'locality':
        comparison = a.locality.localeCompare(b.locality);
        break;
      case 'criticality':
        const critOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison = critOrder[a.criticality] - critOrder[b.criticality];
        break;
      case 'status':
        comparison = a.lifecycle.status.localeCompare(b.lifecycle.status);
        break;
      case 'lastSeen':
        comparison = new Date(b.lifecycle.lastSeen).getTime() - new Date(a.lifecycle.lastSeen).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets by hostname, IP, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>

        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">
          <Columns className="w-4 h-4" />
          Columns
        </button>

        <div className="flex-1" />

        {selectedAssetIds.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedAssetIds.length} selected</span>
            <button className="px-3 py-1.5 bg-secondary rounded hover:bg-muted transition-colors">
              Bulk Edit
            </button>
          </div>
        )}

        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto ndr-scrollbar">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 sticky top-0">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox 
                  checked={selectedAssetIds.length === filteredAssets.length && filteredAssets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="w-8 px-2 py-3"></th>
              <SortHeader field="hostname">Hostname</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                IP Address
              </th>
              <SortHeader field="type">Type</SortHeader>
              <SortHeader field="locality">Locality</SortHeader>
              <SortHeader field="criticality">Criticality</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Exposure
              </th>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="lastSeen">Last Seen</SortHeader>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedAssets.map((asset) => (
              <tr 
                key={asset.id}
                className={cn(
                  'transition-colors cursor-pointer',
                  selectedAssetId === asset.id 
                    ? 'bg-primary/10' 
                    : 'hover:bg-secondary/50'
                )}
                onClick={() => onSelectAsset(asset.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedAssetIds.includes(asset.id)}
                    onCheckedChange={() => handleToggleSelect(asset.id)}
                  />
                </td>
                <td className="px-2 py-3">
                  <StatusIndicator status={asset.lifecycle.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AssetTypeIcon type={asset.type} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">{asset.identity.hostname}</div>
                      {asset.identity.fqdn && asset.identity.fqdn !== asset.identity.hostname && (
                        <div className="text-xs text-muted-foreground">{asset.identity.fqdn}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-xs">
                    {asset.identity.ipv4Addresses[0]}
                    {asset.identity.ipv4Addresses.length > 1 && (
                      <span className="text-muted-foreground ml-1">
                        +{asset.identity.ipv4Addresses.length - 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-muted-foreground capitalize">
                    {asset.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <LocalityBadge locality={asset.locality} />
                </td>
                <td className="px-4 py-3">
                  <CriticalityBadge criticality={asset.criticality} />
                </td>
                <td className="px-4 py-3">
                  <ExposureBadge 
                    hasPublicIP={asset.exposure.hasPublicIP} 
                    hasInboundInternet={asset.exposure.hasInboundInternet} 
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusIndicator status={asset.lifecycle.status} showLabel />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(asset.lifecycle.lastSeen)}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditAsset?.(asset.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Add to Group</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Trusted</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => onDeleteAsset?.(asset.id)}
                      >
                        Delete Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
        <span>
          Showing {sortedAssets.length} of {assets.length} assets
        </span>
        <div className="flex items-center gap-4">
          <span>Rows per page: 50</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
