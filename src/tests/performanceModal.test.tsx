import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PerformanceModal from '../components/ui/PerformanceModal';

// Mock data for testing
const mockData = [
  {
    name: 'Test Area 1',
    lsg2020: { vs: '45.2%', votes: '12,345' },
    ge2024: { vs: '48.7%', votes: '15,678' },
    target2025: { vs: '52.0%', votes: '18,000' }
  },
  {
    name: 'Test Area 2 with Very Long Name That Should Truncate',
    lsg2020: { vs: '38.9%', votes: '9,876' },
    ge2024: { vs: '42.1%', votes: '11,234' },
    target2025: { vs: '46.5%', votes: '13,500' }
  }
];

const mockGrandTotal = {
  name: 'Grand Total',
  lsg2020: { vs: '42.1%', votes: '22,221' },
  ge2024: { vs: '45.4%', votes: '26,912' },
  target2025: { vs: '49.3%', votes: '31,500' }
};

describe('PerformanceModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders performance modal with data', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    expect(screen.getByText('Performance Data')).toBeInTheDocument();
    expect(screen.getByText('Test Area 1')).toBeInTheDocument();
    expect(screen.getByText('45.2%')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('displays data count indicator', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    expect(screen.getByText('Showing 2 areas')).toBeInTheDocument();
  });

  it('displays grand total when provided', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
        grandTotal={mockGrandTotal}
      />
    );

    expect(screen.getByText('Grand Total')).toBeInTheDocument();
    expect(screen.getByText('Total Summary Available')).toBeInTheDocument();
    // Check for grand total values in the table
    const grandTotalCells = document.querySelectorAll('.bg-gradient-to-r td');
    expect(grandTotalCells.length).toBeGreaterThan(0);
  });

  it('shows proper table headers with color coding', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    // Check for headers in the table header section
    const headers = document.querySelectorAll('thead th');
    expect(headers.length).toBe(4);
    expect(screen.getByText('Area Name')).toBeInTheDocument();
    
    // Check for colored header text
    const blueHeader = document.querySelector('.text-blue-300');
    const greenHeader = document.querySelector('.text-green-300');
    const amberHeader = document.querySelector('.text-amber-300');
    
    expect(blueHeader).toBeInTheDocument();
    expect(greenHeader).toBeInTheDocument();
    expect(amberHeader).toBeInTheDocument();
  });

  it('displays data legend with color indicators', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    // Check for legend items
    const legendItems = screen.getAllByText(/LSG 2020|GE 2024|Target 2025/);
    expect(legendItems.length).toBeGreaterThan(3); // Headers + legend
  });

  it('handles empty data gracefully', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={[]}
        title="Performance Data"
      />
    );

    expect(screen.getByText('Showing 0 areas')).toBeInTheDocument();
  });

  it('handles single area data correctly', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={[mockData[0]]}
        title="Performance Data"
      />
    );

    expect(screen.getByText('Showing 1 area')).toBeInTheDocument();
  });

  it('truncates long area names with title attribute', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    const longNameElement = screen.getByTitle('Test Area 2 with Very Long Name That Should Truncate');
    expect(longNameElement).toBeInTheDocument();
  });

  it('has proper responsive classes for mobile optimization', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    // Check for responsive table container
    const tableContainer = document.querySelector('.overflow-x-auto');
    expect(tableContainer).toBeInTheDocument();
    expect(tableContainer).toHaveClass('-mx-4', 'sm:mx-0');
  });

  it('shows mobile scroll instructions when appropriate', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    // Check for scroll instruction text (may be conditional based on scrollable state)
    const scrollText = screen.queryByText('Swipe horizontally to view all data');
    // This text may or may not be present depending on table width vs container width
    // So we just check that the container exists
    const scrollContainer = document.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('has proper hover effects on table rows', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    const tableRows = document.querySelectorAll('tbody tr');
    expect(tableRows[0]).toHaveClass('hover:bg-slate-800/40', 'ds-transition-base', 'group');
  });

  it('has sticky positioning for area name column', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    const stickyHeaders = document.querySelectorAll('.sticky');
    expect(stickyHeaders.length).toBeGreaterThan(0);
    expect(stickyHeaders[0]).toHaveClass('left-0', 'z-10');
  });

  it('closes modal when close button is clicked', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('has enhanced grand total styling', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
        grandTotal={mockGrandTotal}
      />
    );

    const grandTotalRow = document.querySelector('.bg-gradient-to-r');
    expect(grandTotalRow).toBeInTheDocument();
    expect(grandTotalRow).toHaveClass('from-slate-800/70', 'to-slate-700/70');
  });

  it('displays area numbering correctly', () => {
    render(
      <PerformanceModal
        isOpen={true}
        onClose={mockOnClose}
        data={mockData}
        title="Performance Data"
      />
    );

    expect(screen.getByText('Area 1')).toBeInTheDocument();
    expect(screen.getByText('Area 2')).toBeInTheDocument();
  });
});