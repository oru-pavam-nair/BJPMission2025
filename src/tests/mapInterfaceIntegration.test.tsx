import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IntegratedKeralaMap from '../components/IntegratedKeralaMap';

// Mock the mobile detection hook
vi.mock('../utils/mobileDetection', () => ({
  useMobileDetection: () => ({
    isMobile: false,
    isTablet: false,
    isTouchDevice: false,
    screenSize: { width: 1024, height: 768 }
  }),
  optimizeTouchInteractions: vi.fn()
}));

// Mock all the data loading utilities
vi.mock('../utils/loadACData', () => ({
  loadACData: vi.fn().mockResolvedValue({}),
  ACData: {}
}));

vi.mock('../utils/loadMandalData', () => ({
  loadMandalData: vi.fn().mockResolvedValue({}),
  MandalData: {}
}));

// Mock all other data loading utilities
vi.mock('../utils/loadACVoteShareData', () => ({
  loadACVoteShareData: vi.fn().mockResolvedValue([]),
  getACVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadMandalVoteShareData', () => ({
  loadMandalVoteShareData: vi.fn().mockResolvedValue([]),
  getMandalVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadLocalBodyVoteShareData', () => ({
  loadLocalBodyVoteShareData: vi.fn().mockResolvedValue([]),
  getLocalBodyVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadOrgDistrictTargetData', () => ({
  loadOrgDistrictTargetData: vi.fn().mockResolvedValue([]),
  getOrgDistrictTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadACTargetData', () => ({
  loadACTargetData: vi.fn().mockResolvedValue([]),
  getACTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadMandalTargetData', () => ({
  loadMandalTargetData: vi.fn().mockResolvedValue([]),
  getMandalTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadOrgDistrictContacts', () => ({
  loadOrgDistrictContacts: vi.fn().mockResolvedValue([])
}));

vi.mock('../utils/loadMandalContactData', () => ({
  loadMandalContactData: vi.fn().mockResolvedValue([]),
  getMandalContactData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadLocalBodyContactData', () => ({
  loadLocalBodyContactData: vi.fn().mockResolvedValue([]),
  getLocalBodyContactData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadZoneTargetData', () => ({
  loadZoneTargetData: vi.fn().mockResolvedValue([]),
  getZoneTargetData: vi.fn().mockReturnValue([])
}));

// Mock PDF generators
vi.mock('../utils/mapPdfExporter', () => ({
  generateMapPDF: vi.fn().mockResolvedValue(true),
  generateMapPDFMobile: vi.fn().mockResolvedValue(true)
}));

describe('Map Interface Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock iframe load behavior
    Object.defineProperty(HTMLIFrameElement.prototype, 'onload', {
      set: function(fn) {
        setTimeout(fn, 100);
      }
    });
  });

  describe('Z-Index Hierarchy', () => {
    it('should have proper z-index layering for all UI elements', async () => {
      render(<IntegratedKeralaMap />);
      
      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
      });

      // Check control panel z-index (should be navigation level: 10)
      const controlPanel = document.querySelector('[style*="z-index"]');
      expect(controlPanel).toHaveStyle('z-index: 10');

      // Check map controls z-index (should be toast level: 50)
      const mapControls = screen.getByTitle('Refresh Map').closest('div');
      expect(mapControls).toHaveStyle('z-index: 50');
    });

    it('should show loading state with proper z-index', async () => {
      render(<IntegratedKeralaMap />);
      
      // Loading indicator should be visible initially
      const loadingIndicator = screen.getByText('Loading Kerala Map');
      expect(loadingIndicator).toBeInTheDocument();
      
      // Check loading overlay z-index (should be 60)
      const loadingOverlay = loadingIndicator.closest('div');
      expect(loadingOverlay).toHaveStyle('z-index: 60');
    });

    it('should show error state with proper z-index when map fails to load', async () => {
      // Mock iframe error
      Object.defineProperty(HTMLIFrameElement.prototype, 'onerror', {
        set: function(fn) {
          setTimeout(fn, 100);
        }
      });

      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByText('Map Loading Error')).toBeInTheDocument();
      });

      const errorOverlay = screen.getByText('Map Loading Error').closest('div');
      expect(errorOverlay).toHaveStyle('z-index: 60');
    });
  });

  describe('Map Container Margins', () => {
    it('should adjust map container margins based on control panel state', async () => {
      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
      });

      // Check map container has proper margin for expanded control panel
      const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
      expect(mapContainer).toHaveStyle('margin-left: 20rem'); // 80 * 0.25rem = 20rem
    });

    it('should adjust margins when control panel is collapsed', async () => {
      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
      });

      // Find and click collapse button
      const collapseButton = screen.getByLabelText('Collapse panel');
      fireEvent.click(collapseButton);

      // Check map container adjusts margin for collapsed panel
      const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
      await waitFor(() => {
        expect(mapContainer).toHaveStyle('margin-left: 4rem'); // 16 * 0.25rem = 4rem
      });
    });

    it('should have no left margin on mobile devices', () => {
      // Mock mobile detection
      vi.mocked(require('../utils/mobileDetection').useMobileDetection).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTouchDevice: true,
        screenSize: { width: 375, height: 667 }
      });

      render(<IntegratedKeralaMap />);
      
      const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
      expect(mapContainer).toHaveStyle('margin-left: 0');
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state initially', () => {
      render(<IntegratedKeralaMap />);
      
      expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we load the interactive map data')).toBeInTheDocument();
    });

    it('should hide loading state when map loads successfully', async () => {
      render(<IntegratedKeralaMap />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading Kerala Map')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show error state with retry functionality', async () => {
      // Mock iframe error
      Object.defineProperty(HTMLIFrameElement.prototype, 'onerror', {
        set: function(fn) {
          setTimeout(fn, 100);
        }
      });

      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByText('Map Loading Error')).toBeInTheDocument();
      });

      expect(screen.getByText('Unable to load the interactive map. Please try refreshing.')).toBeInTheDocument();
      
      // Test retry button
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveStyle('min-height: 44px');
      expect(retryButton).toHaveStyle('min-width: 44px');
    });

    it('should position loading and error states correctly relative to control panel', async () => {
      render(<IntegratedKeralaMap />);
      
      // Check loading state positioning
      const loadingOverlay = screen.getByText('Loading Kerala Map').closest('div');
      expect(loadingOverlay).toHaveStyle('margin-left: 20rem'); // Accounts for control panel
    });
  });

  describe('Map Controls Integration', () => {
    it('should render map controls with proper positioning', async () => {
      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
        expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
      });

      // Check controls are positioned correctly
      const refreshButton = screen.getByTitle('Refresh Map');
      const fullscreenButton = screen.getByTitle('Enter Fullscreen');
      
      expect(refreshButton).toHaveStyle('min-height: 44px');
      expect(refreshButton).toHaveStyle('min-width: 44px');
      expect(fullscreenButton).toHaveStyle('min-height: 44px');
      expect(fullscreenButton).toHaveStyle('min-width: 44px');
    });

    it('should handle fullscreen toggle correctly', async () => {
      // Mock fullscreen API
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: null
      });
      
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        writable: true,
        value: mockRequestFullscreen
      });

      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
      });

      const fullscreenButton = screen.getByTitle('Enter Fullscreen');
      fireEvent.click(fullscreenButton);

      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    it('should handle map refresh correctly', async () => {
      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
      });

      const refreshButton = screen.getByTitle('Refresh Map');
      fireEvent.click(refreshButton);

      // Should show loading state again
      expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile layout correctly', () => {
      // Mock mobile detection
      vi.mocked(require('../utils/mobileDetection').useMobileDetection).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTouchDevice: true,
        screenSize: { width: 375, height: 667 }
      });

      render(<IntegratedKeralaMap />);
      
      // Check mobile-specific styling
      const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
      expect(mapContainer).toHaveStyle('margin-left: 0');
      
      // Check mobile control panel (should show floating button)
      expect(screen.getByLabelText('Open control panel')).toBeInTheDocument();
    });

    it('should handle tablet layout correctly', () => {
      // Mock tablet detection
      vi.mocked(require('../utils/mobileDetection').useMobileDetection).mockReturnValue({
        isMobile: false,
        isTablet: true,
        isTouchDevice: true,
        screenSize: { width: 768, height: 1024 }
      });

      render(<IntegratedKeralaMap />);
      
      // Should use desktop layout for tablet
      const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
      expect(mapContainer).toHaveStyle('margin-left: 20rem');
    });
  });

  describe('Touch Target Compliance', () => {
    it('should have minimum 44px touch targets for all interactive elements', async () => {
      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
      });

      // Check map controls
      const refreshButton = screen.getByTitle('Refresh Map');
      const fullscreenButton = screen.getByTitle('Enter Fullscreen');
      
      expect(refreshButton).toHaveStyle('min-height: 44px');
      expect(refreshButton).toHaveStyle('min-width: 44px');
      expect(fullscreenButton).toHaveStyle('min-height: 44px');
      expect(fullscreenButton).toHaveStyle('min-width: 44px');

      // Check control panel buttons
      const leadershipButton = screen.getByText('Leadership Contacts');
      const performanceButton = screen.getByText('Vote Share Performance');
      
      expect(leadershipButton).toHaveStyle('min-height: 44px');
      expect(performanceButton).toHaveStyle('min-height: 44px');
    });
  });

  describe('Performance Optimizations', () => {
    it('should use proper iframe attributes for performance', async () => {
      render(<IntegratedKeralaMap />);
      
      await waitFor(() => {
        expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
      });

      const iframe = screen.getByTitle('Kerala Interactive Map');
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
      expect(iframe).toHaveStyle('touch-action: manipulation');
      expect(iframe).toHaveStyle('user-select: none');
      expect(iframe).toHaveStyle('-webkit-overflow-scrolling: touch');
    });

    it('should have proper transition timing for layout changes', async () => {
      render(<IntegratedKeralaMap />);
      
      const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
      expect(mapContainer).toHaveClass('transition-all', 'duration-300');
    });
  });
});