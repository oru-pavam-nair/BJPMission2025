import React from 'react';
import { 
  Users, 
  Home, 
  Vote,
  TrendingUp,
  Target,
  MapPin
} from 'lucide-react';

interface StatData {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  variant: 'primary' | 'success' | 'warning' | 'info';
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

interface UnifiedStatsGridProps {
  currentContext: {
    level: string;
    zone: string;
    org: string;
    ac: string;
    mandal: string;
  };
  className?: string;
}

const UnifiedStatsGrid: React.FC<UnifiedStatsGridProps> = ({ 
  currentContext, 
  className = '' 
}) => {
  // Generate stats based on current context
  const getStatsForContext = (): StatData[] => {
    const { level, zone, org, ac, mandal } = currentContext;
    
    // Base stats that change based on context
    const baseStats: StatData[] = [
      {
        label: level === 'wards' ? 'Total Wards' : level === 'panchayats' ? 'Total Panchayats' : 'Total Areas',
        value: level === 'wards' ? '18' : level === 'panchayats' ? '4,241' : '156',
        icon: MapPin,
        variant: 'primary',
        change: { value: '+12%', trend: 'up' }
      },
      {
        label: 'Total Houses',
        value: '4,241',
        icon: Home,
        variant: 'success',
        change: { value: '+8%', trend: 'up' }
      },
      {
        label: 'Total Voters',
        value: '19,515',
        icon: Users,
        variant: 'info',
        change: { value: '+5%', trend: 'up' }
      },
      {
        label: 'Target Achievement',
        value: '67%',
        icon: Target,
        variant: 'warning',
        change: { value: '+15%', trend: 'up' }
      }
    ];

    return baseStats;
  };

  const stats = getStatsForContext();

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'stat-card-unified primary';
      case 'success':
        return 'stat-card-unified success';
      case 'warning':
        return 'stat-card-unified warning';
      case 'info':
        return 'stat-card-unified';
      default:
        return 'stat-card-unified';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} className="text-green-400" />;
      case 'down':
        return <TrendingUp size={12} className="text-red-400 rotate-180" />;
      default:
        return null;
    }
  };

  return (
    <div className={`stats-dashboard-clean fade-in-up ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className={getVariantClasses(stat.variant)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon className="stat-icon" size={24} />
              {stat.change && (
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(stat.change.trend)}
                  <span className={
                    stat.change.trend === 'up' ? 'text-green-400' : 
                    stat.change.trend === 'down' ? 'text-red-400' : 
                    'text-gray-400'
                  }>
                    {stat.change.value}
                  </span>
                </div>
              )}
            </div>
            
            <div className="stat-value">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            
            <div className="stat-label">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UnifiedStatsGrid;