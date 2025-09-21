import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlPanel from '../components/layout/ControlPanel';

describe('Responsive Control Panel', () => {
  const mockProps = {
    onShowLeadership: vi.fn(),
    onShowPerformance: vi.fn(),
    onShowTargets: vi.fn(),
    onExportPDF: vi.fn(),
    onCollapseChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Layout', () => {
    it('shows expanded sidebar by default', () => {
      render(<ControlPanel {...mockProps} isMobile={false} />);
      
      expect(screen.getByText('Dashboard Controls')).toBeInTheDocument();
      expect(screen.getByText('Access key features and reports')).toBeInTheDocument();
      expect(screen.getByText('Quick Tips')).toBeInTheDocument();
    });

    it('collapses sidebar when toggle is clicked', () => {
      render(<ControlPanel {...mockProps} isMobile={false} />);
      
      const collapseButton = screen.getByLabelText('Collapse panel');
      fireEvent.click(collapseButton);
      
      expect(mockProps.onCollapseChange).toHaveBeenCalledWith(true);
      expect(screen.getByLabelText('Expand panel')).toBeInTheDocument();
    });

    it('shows tooltips for collapsed buttons', () => {
      render(<ControlPanel {...mockProps} isMobile={false} />);
      
      // Simulate collapsed state
      const collapseButton = screen.getByLabelText('Collapse panel');
      fireEvent.click(collapseButton);
      
      // In collapsed state, buttons should have title attributes for tooltips
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('title')?.includes('Leadership') ||
        btn.getAttribute('title')?.includes('Performance') ||
        btn.getAttribute('title')?.includes('Targets') ||
        btn.getAttribute('title')?.includes('Export')
      );
      
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Layout', () => {
    it('shows floating action button', () => {
      render(<ControlPanel {...mockProps} isMobile={true} />);
      
      const fab = screen.getByLabelText('Open control panel');
      expect(fab).toBeInTheDocument();
      expect(fab).toHaveClass('fixed', 'bottom-6', 'right-6');
    });

    it('opens bottom sheet when FAB is clicked', () => {
      render(<ControlPanel {...mockProps} isMobile={true} />);
      
      const fab = screen.getByLabelText('Open control panel');
      fireEvent.click(fab);
      
      expect(screen.getByText('Dashboard Controls')).toBeInTheDocument();
      // The close button doesn't have a label, just check it exists
      const closeButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-x')
      );
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('closes bottom sheet when backdrop is clicked', () => {
      render(<ControlPanel {...mockProps} isMobile={true} />);
      
      // Open bottom sheet
      const fab = screen.getByLabelText('Open control panel');
      fireEvent.click(fab);
      
      // Find and click backdrop
      const backdrop = document.querySelector('.ds-modal-backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      
      // Bottom sheet should close (Dashboard Controls should not be visible)
      expect(screen.queryByText('Dashboard Controls')).not.toBeInTheDocument();
    });

    it('closes bottom sheet when control button is clicked', () => {
      render(<ControlPanel {...mockProps} isMobile={true} />);
      
      // Open bottom sheet
      const fab = screen.getByLabelText('Open control panel');
      fireEvent.click(fab);
      
      // Click a control button
      const leadershipButton = screen.getByText('Leadership Contacts');
      fireEvent.click(leadershipButton);
      
      // Should call the handler and close the sheet
      expect(mockProps.onShowLeadership).toHaveBeenCalled();
      expect(screen.queryByText('Dashboard Controls')).not.toBeInTheDocument();
    });

    it('has proper touch targets for mobile', () => {
      render(<ControlPanel {...mockProps} isMobile={true} />);
      
      const fab = screen.getByLabelText('Open control panel');
      fireEvent.click(fab);
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('Leadership') || 
        btn.textContent?.includes('Performance') || 
        btn.textContent?.includes('Targets') || 
        btn.textContent?.includes('Export')
      );
      
      buttons.forEach(button => {
        expect(button).toHaveClass('ds-touch-target');
        expect(button).toHaveClass('min-h-[80px]');
      });
    });
  });

  describe('Button Consistency', () => {
    it('maintains consistent styling across all buttons', () => {
      render(<ControlPanel {...mockProps} isMobile={false} />);
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('Leadership') || 
        btn.textContent?.includes('Performance') || 
        btn.textContent?.includes('Targets') || 
        btn.textContent?.includes('Export')
      );
      
      buttons.forEach(button => {
        expect(button).toHaveClass('ds-touch-target');
        expect(button).toHaveClass('bg-gradient-to-r');
        expect(button).toHaveClass('rounded-xl');
        expect(button).toHaveClass('shadow-lg');
        expect(button).toHaveClass('ds-transition-fast');
        expect(button).toHaveClass('transform');
        expect(button).toHaveClass('hover:scale-105');
        expect(button).toHaveClass('ds-focus-ring');
      });
    });

    it('has proper spacing between buttons', () => {
      render(<ControlPanel {...mockProps} isMobile={false} />);
      
      // Find the container that holds all the control buttons
      const controlsContainer = screen.getByText('Leadership Contacts').closest('[class*="space-y"]');
      expect(controlsContainer).toBeInTheDocument();
      expect(controlsContainer).toHaveClass('space-y-3');
    });
  });
});