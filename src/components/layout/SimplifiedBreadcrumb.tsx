import React from 'react';
import { ChevronLeft, Home, MapPin } from 'lucide-react';

interface BreadcrumbLevel {
  name: string;
  level: string;
}

interface SimplifiedBreadcrumbProps {
  currentContext: {
    level: string;
    zone: string;
    org: string;
    ac: string;
    mandal: string;
  };
  onNavigateBack?: () => void;
  onNavigateHome?: () => void;
  className?: string;
}

const SimplifiedBreadcrumb: React.FC<SimplifiedBreadcrumbProps> = ({
  currentContext,
  onNavigateBack,
  onNavigateHome,
  className = ''
}) => {
  const { level, zone, org, ac, mandal } = currentContext;

  // Build breadcrumb path showing only current and parent level
  const getBreadcrumbPath = (): { current: BreadcrumbLevel; parent?: BreadcrumbLevel } => {
    switch (level) {
      case 'zones':
        return { current: { name: 'Kerala Zones', level: 'zones' } };
      
      case 'orgs':
        return {
          parent: { name: 'Kerala', level: 'zones' },
          current: { name: zone || 'Zone', level: 'orgs' }
        };
      
      case 'acs':
        return {
          parent: { name: zone || 'Zone', level: 'orgs' },
          current: { name: org || 'Org District', level: 'acs' }
        };
      
      case 'mandals':
        return {
          parent: { name: org || 'Org District', level: 'acs' },
          current: { name: ac || 'Assembly Constituency', level: 'mandals' }
        };
      
      case 'panchayats':
      case 'wards':
        return {
          parent: { name: ac || 'Assembly Constituency', level: 'mandals' },
          current: { name: mandal || 'Mandal', level: level }
        };
      
      default:
        return { current: { name: 'Kerala Map', level: 'zones' } };
    }
  };

  const { current, parent } = getBreadcrumbPath();

  const getLevelIcon = (levelType: string) => {
    switch (levelType) {
      case 'zones':
        return <Home size={14} />;
      case 'orgs':
      case 'acs':
      case 'mandals':
      case 'panchayats':
      case 'wards':
        return <MapPin size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  const getLevelDisplayName = (levelType: string) => {
    switch (levelType) {
      case 'zones': return 'Zones';
      case 'orgs': return 'Org Districts';
      case 'acs': return 'Assembly Constituencies';
      case 'mandals': return 'Mandals';
      case 'panchayats': return 'Panchayats';
      case 'wards': return 'Wards';
      default: return 'Map';
    }
  };

  return (
    <div className={`breadcrumb-simplified ${className}`}>
      {/* Home Button */}
      {onNavigateHome && level !== 'zones' && (
        <button
          onClick={onNavigateHome}
          className="breadcrumb-back-button"
          title="Go to Kerala Overview"
        >
          <Home size={14} />
          <span>Kerala</span>
        </button>
      )}

      {/* Back Button */}
      {onNavigateBack && parent && (
        <button
          onClick={onNavigateBack}
          className="breadcrumb-back-button"
          title={`Back to ${parent.name}`}
        >
          <ChevronLeft size={14} />
          <span>{parent.name}</span>
        </button>
      )}

      {/* Current Level Indicator */}
      <div className="flex items-center gap-2">
        {getLevelIcon(current.level)}
        <div className="flex flex-col">
          <span className="nav-level-indicator current">
            {current.name}
          </span>
          <span className="text-xs text-slate-500">
            {getLevelDisplayName(current.level)}
          </span>
        </div>
      </div>

      {/* Level Progress Indicator */}
      <div className="flex items-center gap-1 ml-auto">
        {['zones', 'orgs', 'acs', 'mandals', 'panchayats'].map((levelType, index) => {
          const isActive = levelType === level;
          const isPassed = ['zones', 'orgs', 'acs', 'mandals', 'panchayats'].indexOf(level) > index;
          
          return (
            <div
              key={levelType}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500 scale-125' 
                  : isPassed 
                    ? 'bg-blue-400/60' 
                    : 'bg-slate-600'
              }`}
              title={getLevelDisplayName(levelType)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SimplifiedBreadcrumb;