import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrustEntry, TrustType } from '@/types/asset-management';
import { 
  Plus, 
  X, 
  Edit2, 
  Trash2,
  Shield,
  Globe,
  ScanLine,
  Server,
  Clock,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TrustListsPanelProps {
  entries: TrustEntry[];
  onAdd?: (entry: Partial<TrustEntry>) => void;
  onEdit?: (entry: TrustEntry) => void;
  onDelete?: (entryId: string) => void;
  onToggle?: (entryId: string, isActive: boolean) => void;
}

const typeIcons: Record<TrustType, React.ReactNode> = {
  asset: <Server className="w-4 h-4" />,
  domain: <Globe className="w-4 h-4" />,
  scanner: <ScanLine className="w-4 h-4" />,
  ip_range: <Shield className="w-4 h-4" />,
};

const typeLabels: Record<TrustType, string> = {
  asset: 'Asset',
  domain: 'Domain',
  scanner: 'Scanner',
  ip_range: 'IP Range',
};

export function TrustListsPanel({
  entries,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: TrustListsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<{
    type: TrustType;
    value: string;
    scope: 'global' | 'detection' | 'group';
    reason: string;
  }>({
    type: 'domain',
    value: '',
    scope: 'global',
    reason: '',
  });
  const [activeTab, setActiveTab] = useState<TrustType | 'all'>('all');

  const filteredEntries = activeTab === 'all' 
    ? entries 
    : entries.filter(e => e.type === activeTab);

  const handleSubmit = () => {
    onAdd?.(newEntry);
    setShowAddForm(false);
    setNewEntry({
      type: 'domain',
      value: '',
      scope: 'global',
      reason: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Trust Lists</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage trusted assets, domains, and scanners to reduce false positives and tune detection rules.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Type Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {(['all', 'domain', 'asset', 'scanner', 'ip_range'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              activeTab === type 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {type === 'all' ? 'All' : typeLabels[type]}
            <span className="ml-2 text-xs opacity-70">
              {type === 'all' 
                ? entries.length 
                : entries.filter(e => e.type === type).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Add Trust Entry</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={newEntry.type}
                onValueChange={(v) => setNewEntry({ ...newEntry, type: v as TrustType })}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="scanner">Scanner</SelectItem>
                  <SelectItem value="ip_range">IP Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select 
                value={newEntry.scope}
                onValueChange={(v) => setNewEntry({ ...newEntry, scope: v as 'global' | 'detection' | 'group' })}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="detection">Specific Detection</SelectItem>
                  <SelectItem value="group">Specific Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={newEntry.value}
              onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
              placeholder={
                newEntry.type === 'domain' ? '*.example.com' :
                newEntry.type === 'asset' ? 'hostname.domain.com' :
                newEntry.type === 'scanner' ? '10.0.0.100' :
                '10.0.0.0/24'
              }
              className="bg-input font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason (required)</Label>
            <Textarea
              value={newEntry.reason}
              onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
              placeholder="Explain why this entry is being trusted..."
              className="bg-input min-h-[60px] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!newEntry.value || !newEntry.reason}>
              Add Entry
            </Button>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-10"></TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="text-muted-foreground">
                    {typeIcons[entry.type]}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{typeLabels[entry.type]}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {entry.value}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground capitalize">
                    {entry.scope}
                    {entry.scopeValue && `: ${entry.scopeValue}`}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                    {entry.reason}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </TableCell>
                <TableCell>
                  {entry.isActive ? (
                    <Badge className="bg-low/20 text-low border-low/30">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit?.(entry)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(entry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No trust entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
        <AlertTriangle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Trust entries affect detection behavior</p>
          <p className="text-muted-foreground mt-1">
            Adding entries to trust lists will suppress related detections. Ensure proper justification 
            and approval before adding entries to prevent security blind spots.
          </p>
        </div>
      </div>
    </div>
  );
}
