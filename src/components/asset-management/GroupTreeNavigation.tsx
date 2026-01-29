import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Server,
  Globe,
  Shield,
  Cloud,
  Users,
  ScanLine,
  AlertTriangle,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { AssetGroup } from '@/types/asset-management';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TreeNode {
  id: string;
  name: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  assetCount?: number;
  isDefault?: boolean;
  type?: 'group' | 'category';
}

interface GroupTreeNavigationProps {
  groups: AssetGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup?: () => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

const groupIcons: Record<string, React.ReactNode> = {
  'grp-critical': <AlertTriangle className="w-4 h-4 text-critical" />,
  'grp-internal': <Server className="w-4 h-4 text-internal" />,
  'grp-external': <Globe className="w-4 h-4 text-external" />,
  'grp-dmz': <Shield className="w-4 h-4 text-dmz" />,
  'grp-cloud': <Cloud className="w-4 h-4 text-cloud" />,
  'grp-guest': <Users className="w-4 h-4 text-guest" />,
  'grp-scanners': <ScanLine className="w-4 h-4 text-info" />,
  'grp-internet-facing': <Globe className="w-4 h-4 text-destructive" />,
};

export function GroupTreeNavigation({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
}: GroupTreeNavigationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['cat-inside', 'cat-outside'])
  );

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Organize groups into categories
  const insideGroups = groups.filter(g => 
    ['internal', 'dmz', 'cloud', 'partner'].some(loc => 
      g.name.toLowerCase().includes(loc) || 
      g.rules?.some(r => r.field === 'locality' && ['internal', 'dmz', 'cloud', 'partner'].includes(r.value as string))
    ) || g.id === 'grp-critical' || g.id === 'grp-scanners' || g.id === 'grp-databases' || g.id === 'grp-workstations' || g.id === 'grp-unused'
  );

  const outsideGroups = groups.filter(g => 
    g.id === 'grp-external' || g.id === 'grp-internet-facing' || g.id === 'grp-guest'
  );

  const renderTreeItem = (group: AssetGroup, depth: number = 0) => {
    const hasChildren = groups.some(g => g.parentId === group.id);
    const isExpanded = expandedNodes.has(group.id);
    const isSelected = selectedGroupId === group.id;
    const children = groups.filter(g => g.parentId === group.id);
    const icon = groupIcons[group.id] || <Folder className="w-4 h-4 text-muted-foreground" />;

    return (
      <div key={group.id}>
        <div
          className={cn(
            'group flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer rounded transition-colors',
            isSelected 
              ? 'bg-primary/20 text-primary' 
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(group.id);
            }}
            className={cn(
              'p-0.5 rounded hover:bg-muted',
              !hasChildren && 'invisible'
            )}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onSelectGroup(group.id)}
          >
            {isExpanded && hasChildren ? (
              <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              icon
            )}
            <span className="truncate flex-1">{group.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {group.assetCount}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEditGroup?.(group.id)}>
                Edit Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateGroup?.()}>
                Add Child Group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDeleteGroup?.(group.id)}
                disabled={group.isDefault}
              >
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (
    id: string, 
    label: string, 
    categoryGroups: AssetGroup[],
    icon: React.ReactNode
  ) => {
    const isExpanded = expandedNodes.has(id);
    const topLevelGroups = categoryGroups.filter(g => !g.parentId);

    return (
      <div key={id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-2 text-sm font-medium cursor-pointer',
            'text-foreground hover:bg-secondary rounded transition-colors'
          )}
          onClick={() => toggleNode(id)}
        >
          <button className="p-0.5">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          {icon}
          <span className="flex-1">{label}</span>
          <span className="text-xs text-muted-foreground">
            {categoryGroups.reduce((sum, g) => sum + g.assetCount, 0)}
          </span>
        </div>

        {isExpanded && (
          <div className="ml-2">
            {topLevelGroups.map(group => renderTreeItem(group, 0))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <input
          type="text"
          placeholder="Filter by Group Name"
          className="w-full px-3 py-1.5 text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto ndr-scrollbar p-2">
        {/* All Assets */}
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-2 text-sm font-medium cursor-pointer rounded transition-colors mb-2',
            selectedGroupId === null 
              ? 'bg-primary/20 text-primary' 
              : 'text-foreground hover:bg-secondary'
          )}
          onClick={() => onSelectGroup(null)}
        >
          <Server className="w-4 h-4" />
          <span className="flex-1">All Assets</span>
          <span className="text-xs text-muted-foreground">
            {groups.reduce((sum, g) => sum + g.assetCount, 0)}
          </span>
        </div>

        <div className="h-px bg-border my-2" />

        {/* Inside Hosts */}
        {renderCategory(
          'cat-inside',
          'Inside Hosts',
          insideGroups,
          <Server className="w-4 h-4 text-internal" />
        )}

        {/* Outside Hosts */}
        {renderCategory(
          'cat-outside',
          'Outside Hosts',
          outsideGroups,
          <Globe className="w-4 h-4 text-external" />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Group
        </button>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-1.5 text-xs border border-border rounded hover:bg-secondary transition-colors">
            Import All
          </button>
          <button className="flex-1 px-3 py-1.5 text-xs border border-border rounded hover:bg-secondary transition-colors">
            Export All
          </button>
        </div>
      </div>
    </div>
  );
}
