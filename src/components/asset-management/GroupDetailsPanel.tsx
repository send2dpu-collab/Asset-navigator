import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AssetGroup, GroupOptions, DynamicGroupRule } from '@/types/asset-management';
import { 
  X, 
  Save, 
  Plus,
  Trash2,
  Info,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface GroupDetailsPanelProps {
  group: AssetGroup | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (group: Partial<AssetGroup>) => void;
  onDelete?: () => void;
}

export function GroupDetailsPanel({
  group,
  isNew = false,
  onClose,
  onSave,
  onDelete,
}: GroupDetailsPanelProps) {
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [groupType, setGroupType] = useState<'static' | 'dynamic'>(group?.type || 'static');
  const [ipRanges, setIpRanges] = useState(group?.ipRanges?.join('\n') || '');
  const [rules, setRules] = useState<DynamicGroupRule[]>(group?.rules || []);
  const [options, setOptions] = useState<GroupOptions>(group?.options || {
    enableBaselining: true,
    disableSecurityEventsExcludedServices: false,
    disableFloodAlarms: false,
    trapUnusedAddresses: false,
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSave = () => {
    onSave({
      name,
      description,
      type: groupType,
      ipRanges: ipRanges.split('\n').filter(r => r.trim()),
      rules: groupType === 'dynamic' ? rules : undefined,
      options,
    });
  };

  const addRule = () => {
    setRules([...rules, { field: 'type', operator: 'equals', value: '' }]);
  };

  const updateRule = (index: number, updates: Partial<DynamicGroupRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">
            {isNew ? 'Create New Group' : group?.name}
          </h3>
          {!isNew && group && (
            <p className="text-xs text-muted-foreground">Group ID: {group.id}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto ndr-scrollbar p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Host Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="bg-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Host Group</Label>
            <Select>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— (No Parent)</SelectItem>
                <SelectItem value="grp-internal">Internal Hosts</SelectItem>
                <SelectItem value="grp-external">External Hosts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (512 Char Max)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this group's purpose..."
              className="bg-input min-h-[80px] resize-none"
              maxLength={512}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/512
            </p>
          </div>
        </div>

        {/* Group Type */}
        <div className="space-y-4">
          <Label>Group Type</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="groupType"
                checked={groupType === 'static'}
                onChange={() => setGroupType('static')}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">Static (Manual membership)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="groupType"
                checked={groupType === 'dynamic'}
                onChange={() => setGroupType('dynamic')}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">Dynamic (Rule-based)</span>
            </label>
          </div>
        </div>

        {/* IP Ranges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="ipRanges">IP Addresses And Ranges</Label>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <Textarea
            id="ipRanges"
            value={ipRanges}
            onChange={(e) => setIpRanges(e.target.value)}
            placeholder="ex. 192.168.10.10, 192.168.10, 192.168.10-100, 192.168.10.0/24"
            className="bg-input min-h-[100px] resize-none font-mono text-sm"
          />
          <Button variant="link" size="sm" className="text-primary p-0 h-auto">
            Import IP Addresses and Ranges
          </Button>
        </div>

        {/* Dynamic Rules */}
        {groupType === 'dynamic' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Membership Rules</Label>
              <Button variant="outline" size="sm" onClick={addRule}>
                <Plus className="w-4 h-4 mr-1" />
                Add Rule
              </Button>
            </div>

            {rules.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-lg">
                No rules defined. Add rules to dynamically include assets.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg"
                  >
                    <Select 
                      value={rule.field}
                      onValueChange={(v) => updateRule(index, { field: v })}
                    >
                      <SelectTrigger className="w-32 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                        <SelectItem value="locality">Locality</SelectItem>
                        <SelectItem value="criticality">Criticality</SelectItem>
                        <SelectItem value="tag">Tag</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={rule.operator}
                      onValueChange={(v) => updateRule(index, { operator: v as DynamicGroupRule['operator'] })}
                    >
                      <SelectTrigger className="w-28 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={rule.value as string}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1 bg-input"
                    />

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeRule(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advanced Options */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Advanced Options</span>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                advancedOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Enable baselining for hosts in this group</Label>
                  <p className="text-xs text-muted-foreground">
                    Collect behavioral baseline data for anomaly detection
                  </p>
                </div>
                <Switch
                  checked={options.enableBaselining}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, enableBaselining: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Disable security events using excluded services</Label>
                  <p className="text-xs text-muted-foreground">
                    Suppress alerts for known-good services
                  </p>
                </div>
                <Switch
                  checked={options.disableSecurityEventsExcludedServices}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, disableSecurityEventsExcludedServices: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Disable flood alarms when a host in this group is the target</Label>
                  <p className="text-xs text-muted-foreground">
                    Prevent alert storms from high-traffic assets
                  </p>
                </div>
                <Switch
                  checked={options.disableFloodAlarms}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, disableFloodAlarms: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Trap hosts that scan unused addresses in this group</Label>
                  <p className="text-xs text-muted-foreground">
                    Detect reconnaissance of dark/unused IP space
                  </p>
                </div>
                <Switch
                  checked={options.trapUnusedAddresses}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, trapUnusedAddresses: checked })
                  }
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {isNew ? 'Create Group' : 'Save Changes'}
          </Button>
        </div>
        {!isNew && onDelete && (
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={group?.isDefault}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Group
          </Button>
        )}
      </div>
    </div>
  );
}
