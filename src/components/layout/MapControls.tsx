import React from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { zIndex, spacing, touchTarget } from '../../styles/design-tokens';

interface MapControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onRefresh: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  isFullscreen,
  onToggleFullscreen,
  onRefresh
}) => {
  return (
    <div 
      className="fixed right-4 flex flex-col gap-3"
      style={{ 
        top: isFullscreen ? spacing.lg : '80px', // Adjust for navigation when not fullscreen
        zIndex: zIndex.toast // Use higher z-index to ensure visibility above map
      }}
    >
      <button
        onClick={onRefresh}
        className="ds-touch-target p-3 bg-slate-900/95 hover:bg-slate-800/95 text-white rounded-xl shadow-xl border border-slate-700/50 ds-transition-fast transform hover:scale-105 active:scale-95 ds-focus-ring backdrop-blur-sm"
        title="Refresh Map"
        aria-label="Refresh Map"
        style={{ minHeight: touchTarget.min, minWidth: touchTarget.min }}
      >
        <RotateCcw size={20} />
      </button>
      
      <button
        onClick={onToggleFullscreen}
        className="ds-touch-target p-3 bg-slate-900/95 hover:bg-slate-800/95 text-white rounded-xl shadow-xl border border-slate-700/50 ds-transition-fast transform hover:scale-105 active:scale-95 ds-focus-ring backdrop-blur-sm"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        style={{ minHeight: touchTarget.min, minWidth: touchTarget.min }}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
    </div>
  );
};

export default MapControls;