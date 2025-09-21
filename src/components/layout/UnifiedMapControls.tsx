import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  RotateCcw,
  Layers,
  Info
} from 'lucide-react';

interface UnifiedMapControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onRefresh: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleInfo?: () => void;
  className?: string;
}

const UnifiedMapControls: React.FC<UnifiedMapControlsProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onRefresh,
  onZoomIn,
  onZoomOut,
  onToggleInfo,
  className = ''
}) => {
  const controlGroups = [
    {
      title: 'View Controls',
      controls: [
        {
          id: 'fullscreen',
          icon: isFullscreen ? Minimize : Maximize,
          onClick: onToggleFullscreen,
          tooltip: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
          active: isFullscreen
        }
      ]
    },
    {
      title: 'Map Controls',
      controls: [
        {
          id: 'zoom-in',
          icon: ZoomIn,
          onClick: onZoomIn,
          tooltip: 'Zoom In',
          disabled: !onZoomIn
        },
        {
          id: 'zoom-out',
          icon: ZoomOut,
          onClick: onZoomOut,
          tooltip: 'Zoom Out',
          disabled: !onZoomOut
        },
        {
          id: 'refresh',
          icon: RotateCcw,
          onClick: onRefresh,
          tooltip: 'Refresh Map'
        }
      ]
    },
    {
      title: 'Information',
      controls: [
        {
          id: 'info',
          icon: Info,
          onClick: onToggleInfo,
          tooltip: 'Toggle Information Panel',
          disabled: !onToggleInfo
        }
      ]
    }
  ];

  return (
    <div className={`map-controls-bar ${className}`}>
      {controlGroups.map((group) => (
        <div key={group.title} className="map-control-group">
          {group.controls.map((control) => {
            const Icon = control.icon;
            return (
              <button
                key={control.id}
                onClick={control.onClick}
                disabled={control.disabled}
                className={`map-control-button ${control.active ? 'active' : ''} ${
                  control.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={control.tooltip}
                aria-label={control.tooltip}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default UnifiedMapControls;