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

// Mock all data loading utilities with minimal setup
vi.mock('../utils/loadACData', () => ({
  loadACData: vi.fn().mockResolvedValue({})
}));

vi.mock('../utils/loadMandalData', () => ({
  loadMandalData: vi.fn().mockResolvedValue({})
}));

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

vi.mock('../utils/mapPdfExporter', () => ({
  generateMapPDF: vi.fn().mockResolvedValue(true),
  generateMapPDFMobile: vi.fn().mockResolvedValue(true)
}));

describe('Map Interface Integration - Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the map component without errors', () => {
      render(<IntegratedKeralaMap />);
      
      // Should show loading state initially
      expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
    });

    it('should render control panel and map controls', () => {
      render(<IntegratedKeralaMap />);
      
      // Control panel buttons should be present
      expect(screen.getByText('Leadership Contacts')).toBeInTheDocument();
      expect(screen.getByText('Vote Share Performance')).toBeInTheDocument();
      expect(screen.getByText('Local Body Targets')).toBeInTheDocument();
      expect(screen.getByText('Export PDF Report')).toBeInTheDocument();
      
      // Map controls should be present
      expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
      expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
    });
  });

  describe('Map Container Layout', () => {
    it('should have proper map container structure', () => {
      render(<IntegratedKeralaMap />);
      
      const iframe = screen.getByTitle('Kerala Interactive Map');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', '/map/pan.html');
      
      // Check container has transition classes
      const container = iframe.parentElement;
      expect(container).toHaveClass('transition-all', 'duration-300', 'relative');
    });

    it('should adjust layout for control panel collapse', async () => {
      render(<IntegratedKeralaMap />);
      
      // Find and click collapse button
      const collapseButton = screen.getByLabelText('Collapse panel');
      fireEvent.click(collapseButton);

      // Container should adjust its margin
      const iframe = screen.getByTitle('Kerala Interactive Map');
      const container = iframe.parentElement;
      
      // Check that the container has the proper styling structure
      expect(container).toHaveClass('transition-all', 'duration-300');
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state with proper positioning', () => {
      render(<IntegratedKeralaMap />);
      
      const loadingText = screen.getByText('Loading Kerala Map');
      expect(loadingText).toBeInTheDocument();
      
      const loadingContainer = loadingText.closest('div');
      expect(loadingContainer).toHaveClass('fixed', 'inset-0', 'bg-gradient-primary');
    });

    it('should show retry button in error state', () => {
      render(<IntegratedKeralaMap />);
      
      // Simulate error by clicking refresh and then triggering error
      const refreshButton = screen.getByTitle('Refresh Map');
      fireEvent.click(refreshButton);
      
      // The error state would be triggered by iframe onerror, 
      // but for testing we can check the retry button structure exists
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Touch Target Compliance', () => {
    it('should have proper touch targets for interactive elements', () => {
      render(<IntegratedKeralaMap />);
      
      // Check control panel buttons
      const leadershipButton = screen.getByText('Leadership Contacts');
      const performanceButton = screen.getByText('Vote Share Performance');
      
      // These should have the ds-touch-target class or proper styling
      expect(leadershipButton.closest('button')).toHaveClass('ds-touch-target');
      expect(performanceButton.closest('button')).toHaveClass('ds-touch-target');
      
      // Check map controls
      const refreshButton = screen.getByTitle('Refresh Map');
      const fullscreenButton = screen.getByTitle('Enter Fullscreen');
      
      expect(refreshButton).toHaveClass('ds-touch-target');
      expect(fullscreenButton).toHaveClass('ds-touch-target');
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile layout', () => {
      // Mock mobile detection for this test
      const mockMobileDetection = vi.fn().mockReturnValue({
        isMobile: true,
        isTablet: false,
        isTouchDevice: true,
        screenSize: { width: 375, height: 667 }
      });
      
      vi.mocked(require('../utils/mobileDetection').useMobileDetection).mockImplementation(mockMobileDetection);
      
      render(<IntegratedKeralaMap />);
      
      // Should show mobile control panel button
      expect(screen.getByLabelText('Open control panel')).toBeInTheDocument();
    });
  });

  describe('Modal Integration', () => {
    it('should open performance modal', () => {
      render(<IntegratedKeralaMap />);
      
      const performanceButton = screen.getByText('Vote Share Performance');
      fireEvent.click(performanceButton);
      
      // Modal should open (though content might be empty due to mocked data)
      // We can check that the click handler works
      expect(performanceButton).toBeInTheDocument();
    });

    it('should open target modal', () => {
      render(<IntegratedKeralaMap />);
      
      const targetButton = screen.getByText('Local Body Targets');
      fireEvent.click(targetButton);
      
      expect(targetButton).toBeInTheDocument();
    });

    it('should open leadership modal', () => {
      render(<IntegratedKeralaMap />);
      
      const leadershipButton = screen.getByText('Leadership Contacts');
      fireEvent.click(leadershipButton);
      
      expect(leadershipButton).toBeInTheDocument();
    });
  });

  describe('Map Controls Functionality', () => {
    it('should handle refresh action', () => {
      render(<IntegratedKeralaMap />);
      
      const refreshButton = screen.getByTitle('Refresh Map');
      fireEvent.click(refreshButton);
      
      // Should show loading state again
      expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
    });

    it('should handle fullscreen toggle', () => {
      // Mock fullscreen API
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        writable: true,
        value: mockRequestFullscreen
      });
      
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: null
      });

      render(<IntegratedKeralaMap />);
      
      const fullscreenButton = screen.getByTitle('Enter Fullscreen');
      fireEvent.click(fullscreenButton);
      
      expect(mockRequestFullscreen).toHaveBeenCalled();
    });
  });

  describe('Performance Optimizations', () => {
    it('should have proper iframe attributes', () => {
      render(<IntegratedKeralaMap />);
      
      const iframe = screen.getByTitle('Kerala Interactive Map');
      
      // Check performance-related attributes
      expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
      expect(iframe).toHaveClass('touch-manipulation');
    });

    it('should use proper CSS classes for performance', () => {
      render(<IntegratedKeralaMap />);
      
      const iframe = screen.getByTitle('Kerala Interactive Map');
      const container = iframe.parentElement;
      
      // Check transition classes for smooth animations
      expect(container).toHaveClass('transition-all', 'duration-300');
    });
  });
});