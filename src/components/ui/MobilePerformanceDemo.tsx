import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Zap, Accessibility, Hand } from 'lucide-react';
import MobileOptimizedButton from './MobileOptimizedButton';
import SwipeableModal from './SwipeableModal';
import { 
  useTouchTargetSize, 
  useGPUAnimation, 
  useReducedMotion, 
  useSwipeGesture,
  usePerformantScroll,
  detectDeviceCapabilities 
} from '../../utils/mobilePerformance';

const MobilePerformanceDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string>('');
  const [scrollInfo, setScrollInfo] = useState({ y: 0, direction: 'down' });
  
  const { minSize, deviceType } = useTouchTargetSize();
  const { shouldUseGPU, capabilities } = useGPUAnimation();
  const { prefersReducedMotion } = useReducedMotion();
  
  // Swipe gesture demo
  const { ref: swipeRef } = useSwipeGesture((direction) => {
    setSwipeDirection(direction);
    setTimeout(() => setSwipeDirection(''), 2000);
  });
  
  // Performance scroll tracking
  usePerformantScroll((scrollY, direction) => {
    setScrollInfo({ y: scrollY, direction });
  });
  
  const deviceCapabilities = detectDeviceCapabilities();
  
  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };
  
  const getPerformanceTierColor = () => {
    switch (deviceCapabilities.performanceTier) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-blue-400" />
            Mobile Performance Demo
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Demonstrating touch-friendly interactions, GPU acceleration, reduced motion support, 
            and swipe gestures for optimal mobile performance.
          </p>
        </div>

        {/* Device Information */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            {getDeviceIcon()}
            Device Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Device Type</div>
              <div className="text-white font-medium capitalize">{deviceType}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Touch Target Size</div>
              <div className="text-white font-medium">{minSize}px</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">GPU Acceleration</div>
              <div className="text-white font-medium">
                {shouldUseGPU ? '✅ Enabled' : '❌ Disabled'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Reduced Motion</div>
              <div className="text-white font-medium">
                {prefersReducedMotion ? '✅ Enabled' : '❌ Disabled'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Performance Tier</div>
              <div className={`font-medium capitalize ${getPerformanceTierColor()}`}>
                {deviceCapabilities.performanceTier}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Touch Support</div>
              <div className="text-white font-medium">
                {deviceCapabilities.hasTouch ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>
        </div>

        {/* Touch Target Demo */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">
            Touch-Friendly Interactions
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-300">
              All buttons meet the minimum {minSize}px touch target requirement for {deviceType} devices.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <MobileOptimizedButton 
                variant="primary" 
                size="small"
                onClick={() => console.log('Small button clicked')}
              >
                Small Button
              </MobileOptimizedButton>
              
              <MobileOptimizedButton 
                variant="secondary" 
                size="medium"
                onClick={() => console.log('Medium button clicked')}
              >
                Medium Button
              </MobileOptimizedButton>
              
              <MobileOptimizedButton 
                variant="success" 
                size="large"
                onClick={() => console.log('Large button clicked')}
              >
                Large Button
              </MobileOptimizedButton>
              
              <MobileOptimizedButton 
                variant="warning" 
                loading
                onClick={() => console.log('Loading button clicked')}
              >
                Loading
              </MobileOptimizedButton>
              
              <MobileOptimizedButton 
                variant="danger" 
                disabled
                onClick={() => console.log('Disabled button clicked')}
              >
                Disabled
              </MobileOptimizedButton>
            </div>
          </div>
        </div>

        {/* Swipe Gesture Demo */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Hand className="w-5 h-5" />
            Swipe Gesture Demo
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-300">
              Swipe in any direction on the area below to test gesture recognition.
            </p>
            
            <div 
              ref={swipeRef.ref}
              className="bg-slate-700/50 rounded-lg p-8 border-2 border-dashed border-slate-600 text-center cursor-pointer select-none"
              style={{ minHeight: '120px' }}
            >
              <div className="text-slate-300">
                {swipeDirection ? (
                  <div className="space-y-2">
                    <div className="text-2xl">👆</div>
                    <div className="text-lg font-medium text-blue-400">
                      Swiped {swipeDirection}!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl">✋</div>
                    <div>Swipe here to test gesture detection</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Demo */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">
            Swipeable Modal Demo
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-300">
              Open a modal with swipe-to-close functionality (mobile) and GPU-accelerated animations.
            </p>
            
            <MobileOptimizedButton 
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              Open Swipeable Modal
            </MobileOptimizedButton>
          </div>
        </div>

        {/* Performance Monitoring */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Performance Monitoring
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Scroll Position</div>
              <div className="text-white font-medium">{Math.round(scrollInfo.y)}px</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Scroll Direction</div>
              <div className="text-white font-medium capitalize">{scrollInfo.direction}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Device Memory</div>
              <div className="text-white font-medium">{deviceCapabilities.deviceMemory}GB</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-slate-400">WebGL Support</div>
              <div className="text-white font-medium">
                {deviceCapabilities.hasWebGL ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">
            Accessibility Features
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Reduced Motion Preference</div>
                <div className="text-white">
                  {prefersReducedMotion ? (
                    <span className="text-green-400">✅ Animations disabled for accessibility</span>
                  ) : (
                    <span className="text-blue-400">🎬 Animations enabled</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-slate-400">Focus Management</div>
                <div className="text-white">
                  <span className="text-green-400">✅ Keyboard navigation supported</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-slate-400">
              <p>
                All components include proper ARIA labels, focus management, and respect user 
                accessibility preferences including reduced motion and high contrast modes.
              </p>
            </div>
          </div>
        </div>

        {/* Spacer for scroll testing */}
        <div className="h-96 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="text-lg mb-2">Scroll to test performance monitoring</div>
            <div className="text-sm">Current position: {Math.round(scrollInfo.y)}px</div>
          </div>
        </div>
      </div>

      {/* Swipeable Modal */}
      <SwipeableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mobile Performance Demo Modal"
        enableSwipeToClose={true}
        description="This modal demonstrates swipe-to-close functionality and GPU-accelerated animations"
      >
        <div className="p-6 space-y-4">
          <div className="text-slate-300">
            <h3 className="text-lg font-semibold text-white mb-3">
              Modal Features
            </h3>
            
            <ul className="space-y-2 list-disc list-inside">
              <li>GPU-accelerated animations for smooth performance</li>
              <li>Swipe down to close on mobile devices</li>
              <li>Proper focus management and keyboard navigation</li>
              <li>Respects reduced motion preferences</li>
              <li>Touch-friendly close button with haptic feedback</li>
              <li>Backdrop blur for modern visual effects</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-3">
              <MobileOptimizedButton 
                variant="primary"
                onClick={() => console.log('Modal action 1')}
              >
                Action 1
              </MobileOptimizedButton>
              
              <MobileOptimizedButton 
                variant="secondary"
                onClick={() => console.log('Modal action 2')}
              >
                Action 2
              </MobileOptimizedButton>
              
              <MobileOptimizedButton 
                variant="success"
                onClick={() => setShowModal(false)}
              >
                Close Modal
              </MobileOptimizedButton>
            </div>
          </div>
        </div>
      </SwipeableModal>
    </div>
  );
};

export default MobilePerformanceDemo;