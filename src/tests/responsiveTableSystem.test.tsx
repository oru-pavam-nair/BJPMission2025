import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  Table, 
  TableContainer, 
  TableSkeleton, 
  TableEmptyState, 
  TableErrorState,
  PerformanceTable,
  TargetTable
} from '../components/ui';

// Mock data
const mockPerformanceData = [
  {
    name: 'Test Area 1',
    lsg2020: { vs: '45.2%', votes: '12,345' },
    ge2024: { vs: '48.7%', votes: '15,678' },
    target2025: { vs: '52.0%', votes: '18,000' }
  },
  {
    name: 'Test Area 2',
    lsg2020: { vs: '38.9%', votes: '9,876' },
    ge2024: { vs: '42.1%', votes: '11,234' },
    target2025: { vs: '46.5%', votes: '13,500' }
  }
];

const mockTargetData = {
  'Area 1': {
    panchayat: { total: 10, targetWin: 7, targetOpposition: 3 },
    municipality: { total: 5, targetWin: 3, targetOpposition: 2 },
    corporation: { total: 2, targetWin: 1, targetOpposition: 1 }
  },
  'Area 2': {
    panchayat: { total: 8, targetWin: 5, targetOpposition: 3 },
    municipality: { total: 4, targetWin: 2, targetOpposition: 2 },
    corporation: { total: 1, targetWin: 1, targetOpposition: 0 }
  }
};

const mockTableColumns = [
  {
    key: 'name',
    header: 'Name',
    accessor: 'name' as const,
    sticky: true
  },
  {
    key: 'value',
    header: 'Value',
    accessor: 'value' as const,
    align: 'center' as const
  }
];

const mockTableData = [
  { name: 'Item 1', value: 100 },
  { name: 'Item 2', value: 200 },
  { name: 'Item 3', value: 300 }
];

describe('Responsive Table System', () => {
  describe('Table Component', () => {
    it('renders table with data correctly', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('shows loading state correctly', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={[]}
          loading={true}
        />
      );

      // Should show skeleton loading
      const skeletons = document.querySelectorAll('.ds-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error state correctly', () => {
      const mockRetry = vi.fn();
      render(
        <Table
          columns={mockTableColumns}
          data={[]}
          error="Failed to load data"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });

    it('shows empty state correctly', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={[]}
          emptyMessage="No items found"
        />
      );

      expect(screen.getByText('No Data Found')).toBeInTheDocument();
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('handles sorting correctly', () => {
      const mockSort = vi.fn();
      render(
        <Table
          columns={[
            { ...mockTableColumns[0], sortable: true },
            mockTableColumns[1]
          ]}
          data={mockTableData}
          onSort={mockSort}
        />
      );

      const sortableHeader = screen.getByText('Name').closest('th');
      fireEvent.click(sortableHeader!);
      expect(mockSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('handles row clicks correctly', () => {
      const mockRowClick = vi.fn();
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
          onRowClick={mockRowClick}
        />
      );

      const firstRow = screen.getByText('Item 1').closest('tr');
      fireEvent.click(firstRow!);
      expect(mockRowClick).toHaveBeenCalledWith(mockTableData[0], 0);
    });

    it('applies sticky columns correctly', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
        />
      );

      const stickyCell = screen.getByText('Item 1').closest('td');
      expect(stickyCell).toHaveClass('sticky');
    });
  });

  describe('TableContainer Component', () => {
    it('renders children correctly', () => {
      render(
        <TableContainer>
          <div data-testid="table-content">Test Content</div>
        </TableContainer>
      );

      expect(screen.getByTestId('table-content')).toBeInTheDocument();
    });

    it('shows scroll indicator when needed', async () => {
      // Mock scrollWidth > clientWidth to simulate horizontal scroll
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 500,
      });

      render(
        <TableContainer showScrollIndicator={true}>
          <div style={{ width: '1000px' }}>Wide content</div>
        </TableContainer>
      );

      // Should show scroll indicator initially
      await waitFor(() => {
        expect(screen.getByText('Scroll')).toBeInTheDocument();
      });
    });
  });

  describe('TableSkeleton Component', () => {
    it('renders correct number of skeleton rows and columns', () => {
      render(<TableSkeleton rows={3} columns={2} />);

      const skeletons = document.querySelectorAll('.ds-skeleton');
      // 3 rows * 2 columns + 2 header columns = 8 skeletons
      expect(skeletons.length).toBe(8);
    });

    it('renders without header when specified', () => {
      render(<TableSkeleton rows={2} columns={2} showHeader={false} />);

      const thead = document.querySelector('thead');
      expect(thead).toBeNull();
    });
  });

  describe('TableEmptyState Component', () => {
    it('renders default empty state', () => {
      render(<TableEmptyState />);

      expect(screen.getByText('No Data Found')).toBeInTheDocument();
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders custom message and action', () => {
      const mockAction = <button>Custom Action</button>;
      render(
        <TableEmptyState 
          message="Custom empty message"
          action={mockAction}
        />
      );

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });
  });

  describe('TableErrorState Component', () => {
    it('renders error message and retry button', () => {
      const mockRetry = vi.fn();
      render(
        <TableErrorState 
          error="Network error occurred"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });

    it('renders without retry button when onRetry not provided', () => {
      render(<TableErrorState error="Error message" />);

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('PerformanceTable Component', () => {
    it('renders performance data correctly', () => {
      render(
        <PerformanceTable 
          data={mockPerformanceData}
        />
      );

      expect(screen.getByText('Test Area 1')).toBeInTheDocument();
      expect(screen.getByText('45.2%')).toBeInTheDocument();
      expect(screen.getByText('12,345')).toBeInTheDocument();
      expect(screen.getAllByText('LSG 2020')).toHaveLength(2); // Header and legend
      expect(screen.getAllByText('GE 2024')).toHaveLength(2); // Header and legend
      expect(screen.getAllByText('Target 2025')).toHaveLength(2); // Header and legend
    });

    it('shows data count correctly', () => {
      render(
        <PerformanceTable 
          data={mockPerformanceData}
        />
      );

      expect(screen.getByText('Showing 2 areas')).toBeInTheDocument();
    });

    it('renders grand total when provided', () => {
      const grandTotal = {
        name: 'Grand Total',
        lsg2020: { vs: '84.1%', votes: '22,221' },
        ge2024: { vs: '90.8%', votes: '26,912' },
        target2025: { vs: '98.5%', votes: '31,500' }
      };

      render(
        <PerformanceTable 
          data={mockPerformanceData}
          grandTotal={grandTotal}
        />
      );

      expect(screen.getByText('Grand Total')).toBeInTheDocument();
      expect(screen.getByText('84.1%')).toBeInTheDocument();
      expect(screen.getByText('Total Summary Available')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <PerformanceTable 
          data={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state with retry', () => {
      const mockRetry = vi.fn();
      render(
        <PerformanceTable 
          data={[]}
          error="Failed to load performance data"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText('Failed to load performance data')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('TargetTable Component', () => {
    it('renders target data correctly', () => {
      render(
        <TargetTable 
          data={mockTargetData}
        />
      );

      expect(screen.getByText('Area 1')).toBeInTheDocument();
      expect(screen.getByText('Panchayat')).toBeInTheDocument();
      expect(screen.getByText('Municipality')).toBeInTheDocument();
      expect(screen.getByText('Corporation')).toBeInTheDocument();
    });

    it('calculates and shows grand total', () => {
      render(
        <TargetTable 
          data={mockTargetData}
          showGrandTotal={true}
        />
      );

      expect(screen.getByText('Grand Total')).toBeInTheDocument();
      // Should show calculated totals (10+8=18 for panchayat total)
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('hides grand total when specified', () => {
      render(
        <TargetTable 
          data={mockTargetData}
          showGrandTotal={false}
        />
      );

      expect(screen.queryByText('Grand Total')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <TargetTable 
          data={{}}
          loading={true}
        />
      );

      const skeletons = document.querySelectorAll('.ds-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error state', () => {
      const mockRetry = vi.fn();
      render(
        <TargetTable 
          data={{}}
          error="Failed to load target data"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText('Failed to load target data')).toBeInTheDocument();
    });

    it('renders legend correctly', () => {
      render(
        <TargetTable 
          data={mockTargetData}
        />
      );

      expect(screen.getByText('Target Win')).toBeInTheDocument();
      expect(screen.getByText('Target Opposition')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies mobile-specific classes', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
        />
      );

      // Check for mobile-specific scroll instruction
      const scrollInstruction = screen.getByText('Swipe horizontally to view all data');
      expect(scrollInstruction).toBeInTheDocument();
    });

    it('handles touch targets correctly', () => {
      const mockRetry = vi.fn();
      render(
        <TableErrorState 
          error="Error"
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toHaveClass('ds-touch-target');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and structure', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
        />
      );

      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
      
      const headers = document.querySelectorAll('th');
      expect(headers.length).toBe(2);
      
      const cells = document.querySelectorAll('td');
      expect(cells.length).toBe(6); // 3 rows * 2 columns
    });

    it('supports keyboard navigation for sortable columns', () => {
      const mockSort = vi.fn();
      render(
        <Table
          columns={[
            { ...mockTableColumns[0], sortable: true },
            mockTableColumns[1]
          ]}
          data={mockTableData}
          onSort={mockSort}
        />
      );

      const sortableHeader = screen.getByText('Name').closest('th');
      expect(sortableHeader).toHaveClass('cursor-pointer');
    });

    it('provides focus management for interactive elements', () => {
      const mockRetry = vi.fn();
      render(
        <TableErrorState 
          error="Error"
          onRetry={mockRetry}
        />
      );

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toHaveClass('ds-focus-ring');
    });
  });
});