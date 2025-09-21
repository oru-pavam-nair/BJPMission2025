import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlPanel from '../components/layout/ControlPanel';

describe('ControlPanel Layout', () => {
  const mockProps = {
    onShowLeadership: vi.fn(),
    onShowPerformance: vi.fn(),
    onShowTargets: vi.fn(),
    onExportPDF: vi.fn(),
    onCollapseChange: vi.fn(),
  };

  it('renders desktop control panel with all buttons', () => {
    render(<ControlPanel {...mockProps} isMobile={false} />);
    
    expect(screen.getByText('Dashboard Controls')).toBeInTheDocument();
    expect(screen.getByText('Leadership Contacts')).toBeInTheDocument();
    expect(screen.getByText('Vote Share Performance')).toBeInTheDocument();
    expect(screen.getByText('Local Body Targets')).toBeInTheDocument();
    expect(screen.getByText('Export PDF Report')).toBeInTheDocument();
  });

  it('renders mobile control panel with floating button', () => {
    render(<ControlPanel {...mockProps} isMobile={true} />);
    
    expect(screen.getByLabelText('Open control panel')).toBeInTheDocument();
  });

  it('handles collapse toggle correctly', () => {
    render(<ControlPanel {...mockProps} isMobile={false} />);
    
    const collapseButton = screen.getByLabelText('Collapse panel');
    fireEvent.click(collapseButton);
    
    expect(mockProps.onCollapseChange).toHaveBeenCalledWith(true);
  });

  it('opens mobile bottom sheet when menu button is clicked', () => {
    render(<ControlPanel {...mockProps} isMobile={true} />);
    
    const menuButton = screen.getByLabelText('Open control panel');
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Dashboard Controls')).toBeInTheDocument();
  });

  it('calls correct handlers when buttons are clicked', () => {
    render(<ControlPanel {...mockProps} isMobile={false} />);
    
    fireEvent.click(screen.getByText('Leadership Contacts'));
    expect(mockProps.onShowLeadership).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Vote Share Performance'));
    expect(mockProps.onShowPerformance).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Local Body Targets'));
    expect(mockProps.onShowTargets).toHaveBeenCalled();
    
    fireEvent.click(screen.getByText('Export PDF Report'));
    expect(mockProps.onExportPDF).toHaveBeenCalled();
  });

  it('has consistent button styling and spacing', () => {
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
    });
  });
});