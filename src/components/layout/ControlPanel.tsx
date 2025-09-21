import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { zIndex, touchTarget } from '../../styles/design-tokens';

interface ControlPanelProps {
  onShowLeadership: () => void;
  onShowPerformance: () => void;
  onShowTargets: () => void;
  onExportPDF: () => void;
  isMobile?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onShowLeadership,
  onShowPerformance,
  onShowTargets,
  onExportPDF,
  isMobile = false,
  onCollapseChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle collapse change callback
  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const controls = [
    {
      id: 'leadership',
      label: 'Leadership Contacts',
      icon: Users,
      onClick: onShowLeadership,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'performance',
      label: 'Vote Share Performance',
      icon: TrendingUp,
      onClick: onShowPerformance,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'targets',
      label: 'Local Body Targets',
      icon: Target,
      onClick: onShowTargets,
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      id: 'export',
      label: 'Export PDF Report',
      icon: Download,
      onClick: onExportPDF,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    }
  ];

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-6 right-6 ds-touch-target p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-xl ds-transition-fast transform hover:scale-105 active:scale-95 ds-focus-ring"
          aria-label="Open control panel"
          style={{ 
            zIndex: zIndex.dropdown,
            minHeight: touchTarget.min,
            minWidth: touchTarget.min
          }}
        >
          <Menu size={24} />
        </button>

        {/* Mobile Bottom Sheet */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 flex items-end ds-modal"
            style={{ zIndex: zIndex.modalBackdrop }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm ds-modal-backdrop"
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Bottom Sheet */}
            <div 
              className="relative w-full bg-slate-900/95 backdrop-blur-md rounded-t-2xl border-t border-slate-700/50 p-6 transform ds-transition-base ease-out"
              style={{ zIndex: zIndex.modalContent }}
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Dashboard Controls</h3>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="ds-touch-target p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg ds-transition-fast ds-focus-ring"
                  style={{ minHeight: touchTarget.min, minWidth: touchTarget.min }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-2 gap-4">
                {controls.map((control) => {
                  const Icon = control.icon;
                  return (
                    <button
                      key={control.id}
                      onClick={() => {
                        control.onClick();
                        setIsMobileOpen(false);
                      }}
                      className={`ds-touch-target flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-r ${control.color} ${control.hoverColor} text-white rounded-xl shadow-lg ds-transition-fast transform hover:scale-105 active:scale-95 ds-focus-ring min-h-[80px]`}
                      style={{ minHeight: touchTarget.min }}
                    >
                      <Icon size={24} className="flex-shrink-0" />
                      <span className="text-sm font-medium text-center leading-tight">
                        {control.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div 
      className={`fixed left-0 top-16 bottom-0 bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 ds-transition-base ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}
      style={{ zIndex: zIndex.navigation }} // Use navigation z-index for proper layering
    >
      {/* Collapse Toggle */}
      <button
        onClick={handleCollapseToggle}
        className="absolute -right-3 top-6 ds-touch-target p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full border border-slate-600 ds-transition-fast ds-focus-ring shadow-lg"
        aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        style={{ minHeight: touchTarget.min, minWidth: touchTarget.min }}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="p-4 h-full overflow-y-auto">
        {/* Header */}
        {!isCollapsed && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Dashboard Controls</h2>
            <p className="text-sm text-slate-400">Access key features and reports</p>
          </div>
        )}

        {/* Controls */}
        <div className={`${isCollapsed ? 'space-y-2' : 'space-y-3'}`}>
          {controls.map((control) => {
            const Icon = control.icon;
            return (
              <button
                key={control.id}
                onClick={control.onClick}
                className={`w-full ds-touch-target flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 p-3'} bg-gradient-to-r ${control.color} ${control.hoverColor} text-white rounded-xl shadow-lg ds-transition-fast transform hover:scale-105 active:scale-95 ds-focus-ring`}
                title={isCollapsed ? control.label : undefined}
                style={{ minHeight: touchTarget.min }}
              >
                <Icon size={isCollapsed ? 18 : 20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-left leading-tight">{control.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Additional Info */}
        {!isCollapsed && (
          <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Tips</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Click on map regions to drill down</li>
              <li>• Use controls to view detailed data</li>
              <li>• Export reports for offline use</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;