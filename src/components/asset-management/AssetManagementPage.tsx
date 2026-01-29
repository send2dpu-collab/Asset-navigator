import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  ChevronRight, 
  Server, 
  Shield, 
  Globe, 
  Network,
  FileText,
  History,
  HelpCircle,
  Bell
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GroupTreeNavigation } from './GroupTreeNavigation';
import { AssetInventoryTable } from './AssetInventoryTable';
import { AssetDetailsPanel } from './AssetDetailsPanel';
import { GroupDetailsPanel } from './GroupDetailsPanel';
import { NetworkLocalitiesPanel } from './NetworkLocalitiesPanel';
import { TrustListsPanel } from './TrustListsPanel';
import { 
  mockAssets, 
  mockAssetGroups, 
  mockNetworkLocalities, 
  mockTrustEntries 
} from '@/data/mock-asset-data';
import { Asset, AssetGroup } from '@/types/asset-management';

type PanelMode = 'asset' | 'group' | 'new-group' | null;

export function AssetManagementPage() {
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [isEditingAsset, setIsEditingAsset] = useState(false);

  const selectedAsset = mockAssets.find(a => a.id === selectedAssetId) || null;
  const selectedGroup = mockAssetGroups.find(g => g.id === selectedGroupId) || null;

  // Filter assets by selected group
  const filteredAssets = selectedGroupId 
    ? mockAssets.filter(a => a.groupIds.includes(selectedGroupId))
    : mockAssets;

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setPanelMode('asset');
    setIsEditingAsset(false);
  };

  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroupId(groupId);
    setSelectedAssetId(null);
    setPanelMode(null);
  };

  const handleEditGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setPanelMode('group');
  };

  const handleCreateGroup = () => {
    setPanelMode('new-group');
  };

  const handleClosePanel = () => {
    setPanelMode(null);
    setSelectedAssetId(null);
    setIsEditingAsset(false);
  };

  const handleSaveAsset = (asset: Asset) => {
    console.log('Save asset:', asset);
    setIsEditingAsset(false);
  };

  const handleSaveGroup = (group: Partial<AssetGroup>) => {
    console.log('Save group:', group);
    setPanelMode(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Last 6 hours</span>
          <span className="text-muted-foreground">▾</span>
          <span className="text-muted-foreground mx-2">|</span>
          <span className="text-muted-foreground">Settings</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Asset Management</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Asset Management</h1>
            <p className="text-sm text-muted-foreground">
              Organize and classify network assets for detection, baselining, and policy enforcement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Documentation
          </Button>
          <Button>
            <History className="w-4 h-4 mr-2" />
            Audit Log
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b border-border">
          <TabsList className="h-12 bg-transparent gap-1">
            <TabsTrigger 
              value="assets" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
            >
              <Server className="w-4 h-4 mr-2" />
              Asset Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
            >
              <Network className="w-4 h-4 mr-2" />
              Host Groups
            </TabsTrigger>
            <TabsTrigger 
              value="localities" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
            >
              <Globe className="w-4 h-4 mr-2" />
              Network Localities
            </TabsTrigger>
            <TabsTrigger 
              value="trust" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
            >
              <Shield className="w-4 h-4 mr-2" />
              Trust Lists
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Assets Tab */}
        <TabsContent value="assets" className="flex-1 flex overflow-hidden m-0 p-0">
          {/* Left Panel - Group Tree */}
          <div className="w-72 h-full border-r border-border bg-card flex-shrink-0">
            <GroupTreeNavigation
              groups={mockAssetGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handleSelectGroup}
              onCreateGroup={handleCreateGroup}
              onEditGroup={handleEditGroup}
              onDeleteGroup={(id) => console.log('Delete group:', id)}
            />
          </div>

          {/* Main Content - Asset Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Group Header */}
            {selectedGroupId && selectedGroup && (
              <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{selectedGroup.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditGroup(selectedGroupId)}
                >
                  Edit Group
                </Button>
              </div>
            )}
            
            <AssetInventoryTable
              assets={filteredAssets}
              selectedAssetId={selectedAssetId}
              selectedAssetIds={selectedAssetIds}
              onSelectAsset={handleSelectAsset}
              onSelectMultiple={setSelectedAssetIds}
              onEditAsset={handleSelectAsset}
              onDeleteAsset={(id) => console.log('Delete asset:', id)}
            />
          </div>

          {/* Right Panel - Details */}
          {panelMode && (
            <div className="w-96 border-l border-border bg-card flex-shrink-0 animate-slide-in-right">
              {panelMode === 'asset' && (
                <AssetDetailsPanel
                  asset={selectedAsset}
                  groups={mockAssetGroups}
                  isEditing={isEditingAsset}
                  onClose={handleClosePanel}
                  onEdit={() => setIsEditingAsset(true)}
                  onSave={handleSaveAsset}
                  onDelete={() => console.log('Delete asset')}
                />
              )}
              {panelMode === 'group' && (
                <GroupDetailsPanel
                  group={selectedGroup}
                  onClose={handleClosePanel}
                  onSave={handleSaveGroup}
                  onDelete={() => console.log('Delete group')}
                />
              )}
              {panelMode === 'new-group' && (
                <GroupDetailsPanel
                  group={null}
                  isNew
                  onClose={handleClosePanel}
                  onSave={handleSaveGroup}
                />
              )}
            </div>
          )}
        </TabsContent>

        {/* Host Groups Tab */}
        <TabsContent value="groups" className="flex-1 flex overflow-hidden m-0 p-0">
          {/* Left Panel - Group Tree */}
          <div className="w-72 h-full border-r border-border bg-card flex-shrink-0">
            <GroupTreeNavigation
              groups={mockAssetGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => {
                setSelectedGroupId(id);
                if (id) setPanelMode('group');
              }}
              onCreateGroup={handleCreateGroup}
              onEditGroup={handleEditGroup}
              onDeleteGroup={(id) => console.log('Delete group:', id)}
            />
          </div>

          {/* Main Content - Group Details or Create Form */}
          <div className="flex-1 overflow-auto p-6">
            {panelMode === 'new-group' ? (
              <div className="max-w-3xl">
                <GroupDetailsPanel
                  group={null}
                  isNew
                  onClose={handleClosePanel}
                  onSave={handleSaveGroup}
                />
              </div>
            ) : selectedGroup ? (
              <div className="max-w-3xl">
                <GroupDetailsPanel
                  group={selectedGroup}
                  onClose={() => setSelectedGroupId(null)}
                  onSave={handleSaveGroup}
                  onDelete={() => console.log('Delete group')}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Network className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a Group</p>
                <p className="text-sm text-center mt-2">
                  Choose a host group from the left panel to view and edit its configuration
                </p>
                <Button className="mt-6" onClick={handleCreateGroup}>
                  Create New Group
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Network Localities Tab */}
        <TabsContent value="localities" className="flex-1 overflow-auto m-0 p-0">
          <div className="max-w-4xl mx-auto p-6">
            <NetworkLocalitiesPanel
              localities={mockNetworkLocalities}
              onAdd={() => console.log('Add locality')}
              onEdit={(l) => console.log('Edit locality:', l)}
              onDelete={(id) => console.log('Delete locality:', id)}
            />

            {/* Trusted Domains Section */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Trusted Domains</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a trusted domain to suppress detections that specifically target activity with potentially-malicious domains.
                </p>
              </div>
              <Button variant="link" className="text-primary p-0 h-auto">
                Add Domain
              </Button>

              <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This console manages shared settings for <span className="text-primary">0 of 1 connected sensors</span>.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Trust Lists Tab */}
        <TabsContent value="trust" className="flex-1 overflow-auto m-0 p-0">
          <div className="max-w-6xl mx-auto p-6">
            <TrustListsPanel
              entries={mockTrustEntries}
              onAdd={(e) => console.log('Add entry:', e)}
              onEdit={(e) => console.log('Edit entry:', e)}
              onDelete={(id) => console.log('Delete entry:', id)}
              onToggle={(id, active) => console.log('Toggle:', id, active)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
