import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  BarChart3,
  MapPin,
  Settings
} from 'lucide-react';

interface UnifiedControlPanelProps {
  onShowLeadership: () => void;
  onShowPerformance: () => void;
  onShowTargets: () => void;
  onExportPDF: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  onShowLeadership,
  onShowPerformance,
  onShowTargets,
  onExportPDF,
  isMobile = false,
  isCollapsed = false,
  onCollapseChange
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    onCollapseChange?.(!isCollapsed);
  };

  const controlGroups = [
    {
      title: 'Data & Analytics',
      controls: [
        {
          id: 'performance',
          label: 'Vote Share Performance',
          icon: TrendingUp,
          onClick: onShowPerformance,
          variant: 'primary' as const,
          description: 'View voting performance data'
        },
        {
          id: 'targets',
          label: 'Local Body Targets',
          icon: Target,
          onClick: onShowTargets,
          variant: 'warning' as const,
          description: 'Check target achievements'
        }
      ]
    },
    {
      title: 'Contacts & Leadership',
      controls: [
        {
          id: 'leadership',
          label: 'Leadership Contacts',
          icon: Users,
          onClick: onShowLeadership,
          variant: 'success' as const,
          description: 'Access contact information'
        }
      ]
    },
    {
      title: 'Export & Reports',
      controls: [
        {
          id: 'export',
          label: 'Export PDF Report',
          icon: Download,
          onClick: onExportPDF,
          variant: 'danger' as const,
          description: 'Generate PDF reports'
        }
      ]
    }
  ];

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-xl z-30 flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Open control panel"
        >
          <Menu size={24} />
        </button>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="control-sidebar-unified mobile-open slide-in-left">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Dashboard Controls</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-700/50 hover:bg-slate-600/50 text-white transition-all duration-200"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-4 space-y-6">
                {controlGroups.map((group) => (
                  <div key={group.title} className="control-group">
                    <h3 className="control-group-title">{group.title}</h3>
                    <div className="space-y-2">
                      {group.controls.map((control) => {
                        const Icon = control.icon;
                        return (
                          <button
                            key={control.id}
                            onClick={() => {
                              control.onClick();
                              setMobileOpen(false);
                            }}
                            className={`control-button-clean ${control.variant}`}
                          >
                            <Icon size={20} />
                            <div className="flex-1 text-left">
                              <div className="font-medium">{control.label}</div>
                              <div className="text-xs opacity-75">{control.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`control-sidebar-unified ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button
        onClick={handleToggleCollapse}
        className="control-sidebar-toggle"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          </div>
          <p className="text-sm text-slate-400">Access key features and reports</p>
        </div>
      )}

      {/* Control Groups */}
      <div className="p-4 space-y-6">
        {controlGroups.map((group) => (
          <div key={group.title} className="control-group">
            {!isCollapsed && <h3 className="control-group-title">{group.title}</h3>}
            <div className="space-y-2">
              {group.controls.map((control) => {
                const Icon = control.icon;
                return (
                  <button
                    key={control.id}
                    onClick={control.onClick}
                    className={`control-button-clean ${control.variant}`}
                    title={isCollapsed ? control.label : undefined}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="font-medium">{control.label}</div>
                        <div className="text-xs opacity-75">{control.description}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="mt-auto p-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <MapPin size={14} />
              Quick Tips
            </h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Click map regions to drill down</li>
              <li>• Use controls to view detailed data</li>
              <li>• Export reports for offline use</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedControlPanel;