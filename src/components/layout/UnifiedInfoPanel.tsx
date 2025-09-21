import React, { useState } from 'react';
import { 
  ChevronRight,
  ChevronLeft,
  Users,
  BarChart3,
  MapPin,
  X
} from 'lucide-react';

interface TabData {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

interface UnifiedInfoPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  voterDemographics?: {
    female: { count: number; percentage: number };
    male: { count: number; percentage: number };
  };
  wardsData?: Array<{
    name: string;
    ward: string;
    voters: number;
    houses: number;
  }>;
  panchayatsData?: Array<{
    name: string;
    color: string;
  }>;
  className?: string;
}

const UnifiedInfoPanel: React.FC<UnifiedInfoPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  voterDemographics = {
    female: { count: 10118, percentage: 51.8 },
    male: { count: 9397, percentage: 48.2 }
  },
  wardsData = [
    { name: 'PAVOOR', ward: 'Ward 1', voters: 1218, houses: 252 },
    { name: 'MUDIMAR', ward: 'Ward 2', voters: 1156, houses: 234 }
  ],
  panchayatsData = [
    { name: 'Vorkady', color: '#8B5CF6' },
    { name: 'Manjeshwaram', color: '#EF4444' },
    { name: 'Palvalike', color: '#06B6D4' },
    { name: 'Meenja', color: '#10B981' }
  ],
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('demographics');

  const tabs: TabData[] = [
    {
      id: 'demographics',
      label: 'Demographics',
      icon: Users,
      content: (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white mb-3">Voter Demographics</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-slate-300">Female Voters</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {voterDemographics.female.count.toLocaleString()}
                </div>
                <div className="text-xs text-orange-400">
                  {voterDemographics.female.percentage}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${voterDemographics.female.percentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-300">Male Voters</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {voterDemographics.male.count.toLocaleString()}
                </div>
                <div className="text-xs text-blue-400">
                  {voterDemographics.male.percentage}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${voterDemographics.male.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'areas',
      label: 'Areas',
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white mb-3">Wards in Order</h4>
          
          <div className="space-y-3">
            {wardsData.map((ward, index) => (
              <div 
                key={ward.name}
                className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <span className="font-medium text-white">{ward.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{ward.ward}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-blue-400" />
                    <span className="text-slate-300">{ward.voters.toLocaleString()} voters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-green-400" />
                    <span className="text-slate-300">{ward.houses} houses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'legend',
      label: 'Legend',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white mb-3">Panchayats</h4>
          
          <div className="grid grid-cols-2 gap-2">
            {panchayatsData.map((panchayat) => (
              <div 
                key={panchayat.name}
                className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-md"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: panchayat.color }}
                ></div>
                <span className="text-xs text-slate-300 truncate">
                  {panchayat.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <h5 className="text-xs font-semibold text-white mb-2">Target Areas</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Win</span>
                <span className="text-green-400 font-medium">571</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Opposition</span>
                <span className="text-red-400 font-medium">78</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">NA</span>
                <span className="text-gray-400 font-medium">742</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={`info-panel-unified ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      {/* Header */}
      <div className="info-panel-header">
        <h3 className="info-panel-title">Information</h3>
        <button
          onClick={onToggleCollapse}
          className="info-panel-toggle"
          aria-label={isCollapsed ? 'Show information panel' : 'Hide information panel'}
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Tab Navigation */}
      {!isCollapsed && (
        <>
          <div className="info-tab-system">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`info-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={14} className="mr-1" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="info-content-section">
            {tabs.find(tab => tab.id === activeTab)?.content}
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedInfoPanel;