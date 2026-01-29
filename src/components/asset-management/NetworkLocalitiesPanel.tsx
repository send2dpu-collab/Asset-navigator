import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NetworkLocality } from '@/types/asset-management';
import { 
  Plus, 
  X, 
  Edit2, 
  Trash2,
  Globe,
  Server,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NetworkLocalitiesPanelProps {
  localities: NetworkLocality[];
  onAdd?: () => void;
  onEdit?: (locality: NetworkLocality) => void;
  onDelete?: (localityId: string) => void;
}

export function NetworkLocalitiesPanel({
  localities,
  onAdd,
  onEdit,
  onDelete,
}: NetworkLocalitiesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLocality, setNewLocality] = useState<{
    name: string;
    type: 'internal' | 'external';
    cidrBlocks: string;
    description: string;
  } | null>(null);

  const handleStartAdd = () => {
    setNewLocality({
      name: '',
      type: 'internal',
      cidrBlocks: '',
      description: '',
    });
  };

  const handleCancelAdd = () => {
    setNewLocality(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Network Localities</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Network localities enable you to specify internal and external networks in your environment by adding IP addresses and CIDR blocks with unique names.
        </p>
      </div>

      {/* Existing Localities */}
      <div className="space-y-4">
        {localities.map((locality) => (
          <div 
            key={locality.id}
            className="border border-border rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30">
              <div className="flex items-center gap-3">
                {locality.type === 'internal' ? (
                  <Server className="w-4 h-4 text-internal" />
                ) : (
                  <Globe className="w-4 h-4 text-external" />
                )}
                <div>
                  <div className="font-medium text-foreground">{locality.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {locality.type === 'internal' ? 'Internal' : 'External'}
                    {locality.site && ` • ${locality.site}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit?.(locality)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete?.(locality.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">CIDR Blocks</div>
                <div className="flex flex-wrap gap-2">
                  {locality.cidrBlocks.map(cidr => (
                    <span 
                      key={cidr}
                      className="px-2 py-1 bg-secondary rounded text-sm font-mono"
                    >
                      {cidr}
                    </span>
                  ))}
                </div>
              </div>
              {locality.description && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <p className="text-sm text-muted-foreground">{locality.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Locality Form */}
      {newLocality && (
        <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">New Network Locality</h4>
            <Button variant="ghost" size="icon" onClick={handleCancelAdd}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Network Locality Name</Label>
              <Input
                value={newLocality.name}
                onChange={(e) => setNewLocality({ ...newLocality, name: e.target.value })}
                placeholder="e.g., Boise office"
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Network Locality Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="localityType"
                    checked={newLocality.type === 'internal'}
                    onChange={() => setNewLocality({ ...newLocality, type: 'internal' })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Internal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="localityType"
                    checked={newLocality.type === 'external'}
                    onChange={() => setNewLocality({ ...newLocality, type: 'external' })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">External</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>IP Addresses and CIDR Blocks</Label>
              <div className="bg-input border border-border rounded-md p-2">
                <Input
                  value={newLocality.cidrBlocks}
                  onChange={(e) => setNewLocality({ ...newLocality, cidrBlocks: e.target.value })}
                  placeholder="Enter CIDR block (e.g., 10.0.0.0/8)"
                  className="border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newLocality.description}
                onChange={(e) => setNewLocality({ ...newLocality, description: e.target.value })}
                placeholder="Optional description..."
                className="bg-input min-h-[60px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleCancelAdd}>
              Cancel
            </Button>
            <Button>
              Add Locality
            </Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!newLocality && (
        <Button 
          variant="link" 
          className="text-primary p-0 h-auto"
          onClick={handleStartAdd}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Network Locality
        </Button>
      )}
    </div>
  );
}
