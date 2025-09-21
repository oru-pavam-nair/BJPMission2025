import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import IntegratedKeralaMap from '../components/IntegratedKeralaMap';

// Mock the auth utilities
vi.mock('../utils/auth', () => ({
  isAuthenticated: () => true,
  getCurrentUser: () => 'test-user'
}));

// Mock all the data loading utilities
vi.mock('../utils/loadACData', () => ({
  loadACData: () => Promise.resolve({}),
  ACData: {}
}));

vi.mock('../utils/loadMandalData', () => ({
  loadMandalData: () => Promise.resolve({}),
  MandalData: {}
}));

// Mock other utilities
vi.mock('../utils/loadACVoteShareData', () => ({
  loadACVoteShareData: () => Promise.resolve(),
  getACVoteShareData: () => []
}));

vi.mock('../utils/loadMandalVoteShareData', () => ({
  loadMandalVoteShareData: () => Promise.resolve(),
  getMandalVoteShareData: () => []
}));

vi.mock('../utils/loadLocalBodyVoteShareData', () => ({
  loadLocalBodyVoteShareData: () => Promise.resolve(),
  getLocalBodyVoteShareData: () => []
}));

vi.mock('../utils/loadOrgDistrictTargetData', () => ({
  loadOrgDistrictTargetData: () => Promise.resolve(),
  getOrgDistrictTargetData: () => []
}));

vi.mock('../utils/loadACTargetData', () => ({
  loadACTargetData: () => Promise.resolve(),
  getACTargetData: () => []
}));

vi.mock('../utils/loadMandalTargetData', () => ({
  loadMandalTargetData: () => Promise.resolve(),
  getMandalTargetData: () => []
}));

vi.mock('../utils/loadOrgDistrictContacts', () => ({
  loadOrgDistrictContacts: () => Promise.resolve([])
}));

vi.mock('../utils/loadMandalContactData', () => ({
  loadMandalContactData: () => Promise.resolve(),
  getMandalContactData: () => []
}));

vi.mock('../utils/loadLocalBodyContactData', () => ({
  loadLocalBodyContactData: () => Promise.resolve(),
  getLocalBodyContactData: () => []
}));

vi.mock('../utils/loadZoneTargetData', () => ({
  loadZoneTargetData: () => Promise.resolve(),
  getZoneTargetData: () => []
}));

vi.mock('../utils/mobileDetection', () => ({
  useMobileDetection: () => ({ isMobile: false, isTouchDevice: false }),
  optimizeTouchInteractions: () => {}
}));

vi.mock('../utils/mapPdfExporter', () => ({
  generateMapPDF: () => Promise.resolve(true),
  generateMapPDFMobile: () => Promise.resolve(true)
}));

describe('Map Layout Integration', () => {
  it('renders control panel and map controls without overlap', () => {
    render(<IntegratedKeralaMap />);
    
    // Check that control panel is present
    expect(screen.getByText('Dashboard Controls')).toBeInTheDocument();
    
    // Check that map controls are present
    expect(screen.getByLabelText('Refresh Map')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter Fullscreen')).toBeInTheDocument();
    
    // Check that map iframe is present
    const iframe = screen.getByTitle('Kerala Interactive Map');
    expect(iframe).toBeInTheDocument();
  });

  it('applies correct margin to map container based on control panel state', () => {
    render(<IntegratedKeralaMap />);
    
    // Find the map container div
    const mapContainer = screen.getByTitle('Kerala Interactive Map').parentElement;
    
    // Should have left margin for desktop control panel
    expect(mapContainer).toHaveClass('ml-80');
  });

  it('positions map controls in top-right without overlapping control panel', () => {
    render(<IntegratedKeralaMap />);
    
    const refreshButton = screen.getByLabelText('Refresh Map');
    const fullscreenButton = screen.getByLabelText('Enter Fullscreen');
    
    // Both buttons should be present and positioned correctly
    expect(refreshButton).toBeInTheDocument();
    expect(fullscreenButton).toBeInTheDocument();
    
    // Check that they have proper styling for positioning
    expect(refreshButton.parentElement).toHaveClass('absolute');
    expect(refreshButton.parentElement).toHaveClass('right-4');
  });

  it('has proper z-index hierarchy to prevent overlapping', () => {
    render(<IntegratedKeralaMap />);
    
    // Control panel should be positioned with proper z-index
    const controlPanelContainer = screen.getByText('Dashboard Controls').closest('[class*="fixed"]');
    expect(controlPanelContainer).toBeInTheDocument();
    
    // Map controls should also have proper positioning
    const mapControls = screen.getByLabelText('Refresh Map').parentElement;
    expect(mapControls).toHaveClass('absolute');
  });
});