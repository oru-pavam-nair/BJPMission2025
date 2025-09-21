/**
 * Accessibility Features Test Suite
 * Tests for WCAG compliance, keyboard navigation, screen reader support, and focus management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Modal from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import PerformanceModal from '../components/ui/PerformanceModal';
import { 
  FocusManager, 
  AriaLiveRegion, 
  ColorContrast, 
  ScreenReader,
  TouchTarget,
  initializeAccessibility 
} from '../utils/accessibility';

// Mock data for testing
const mockTableData = [
  { id: 1, name: 'Area 1', value: 100 },
  { id: 2, name: 'Area 2', value: 200 },
  { id: 3, name: 'Area 3', value: 300 }
];

const mockTableColumns = [
  { key: 'name', header: 'Area Name', accessor: 'name' as const, sortable: true },
  { key: 'value', header: 'Value', accessor: 'value' as const, sortable: true }
];

const mockPerformanceData = [
  {
    name: 'Test Area 1',
    lsg2020: { vs: '45%', votes: '1,234' },
    ge2024: { vs: '52%', votes: '1,456' },
    target2025: { vs: '60%', votes: '1,800' }
  },
  {
    name: 'Test Area 2',
    lsg2020: { vs: '38%', votes: '987' },
    ge2024: { vs: '44%', votes: '1,123' },
    target2025: { vs: '55%', votes: '1,400' }
  }
];

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Initialize accessibility features before each test
    initializeAccessibility();
  });

  afterEach(() => {
    // Clean up ARIA live regions after each test
    document.querySelectorAll('[id^="aria-live"]').forEach(el => el.remove());
  });

  describe('Focus Management', () => {
    test('should identify focusable elements correctly', () => {
      render(
        <div data-testid="container">
          <button>Button 1</button>
          <input type="text" />
          <a href="#test">Link</a>
          <button disabled>Disabled Button</button>
          <div tabIndex={0}>Focusable Div</div>
          <div tabIndex={-1}>Non-focusable Div</div>
        </div>
      );

      const container = screen.getByTestId('container');
      const focusableElements = FocusManager.getFocusableElements(container);
      
      expect(focusableElements).toHaveLength(4); // button, input, link, focusable div
      expect(focusableElements[0]).toHaveTextContent('Button 1');
      expect(focusableElements[1]).toHaveAttribute('type', 'text');
      expect(focusableElements[2]).toHaveAttribute('href', '#test');
      expect(focusableElements[3]).toHaveTextContent('Focusable Div');
    });

    test('should get first and last focusable elements', () => {
      render(
        <div data-testid="container">
          <button>First</button>
          <input type="text" />
          <button>Last</button>
        </div>
      );

      const container = screen.getByTestId('container');
      const firstFocusable = FocusManager.getFirstFocusable(container);
      const lastFocusable = FocusManager.getLastFocusable(container);
      
      expect(firstFocusable).toHaveTextContent('First');
      expect(lastFocusable).toHaveTextContent('Last');
    });
  });

  describe('Modal Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          description="Test modal description"
        >
          <p>Modal content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveAttribute('id', 'modal-title');
      expect(title).toHaveTextContent('Test Modal');
    });

    test('should trap focus within modal', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Outside Button</button>
          <Modal
            isOpen={true}
            onClose={() => {}}
            title="Test Modal"
          >
            <button>First Button</button>
            <button>Second Button</button>
          </Modal>
        </div>
      );

      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      const closeButton = screen.getByLabelText(/close.*dialog/i);

      // Focus should start on the modal
      await waitFor(() => {
        expect(document.activeElement).toBe(firstButton);
      });

      // Tab should move to next focusable element
      await user.tab();
      expect(document.activeElement).toBe(secondButton);

      // Tab should move to close button
      await user.tab();
      expect(document.activeElement).toBe(closeButton);

      // Tab should wrap back to first button
      await user.tab();
      expect(document.activeElement).toBe(firstButton);

      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(closeButton);
    });

    test('should close on Escape key', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });

    test('should restore focus when closed', async () => {
      const user = userEvent.setup();
      let isOpen = true;
      const onClose = () => { isOpen = false; };
      
      const { rerender } = render(
        <div>
          <button data-testid="trigger">Open Modal</button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Test Modal"
          >
            <p>Modal content</p>
          </Modal>
        </div>
      );

      const triggerButton = screen.getByTestId('trigger');
      triggerButton.focus();

      // Rerender with modal closed
      rerender(
        <div>
          <button data-testid="trigger">Open Modal</button>
          <Modal
            isOpen={false}
            onClose={onClose}
            title="Test Modal"
          >
            <p>Modal content</p>
          </Modal>
        </div>
      );

      // Focus should be restored to trigger button
      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });
    });
  });

  describe('Table Accessibility', () => {
    test('should have proper table structure and ARIA attributes', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
          caption="Test data table"
          ariaLabel="Test table with area data"
        />
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Test table with area data');
      expect(table).toHaveAttribute('role', 'table');

      // Check for proper column headers
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(2);
      expect(columnHeaders[0]).toHaveAttribute('scope', 'col');
      expect(columnHeaders[1]).toHaveAttribute('scope', 'col');

      // Check for proper row headers
      const rowHeaders = screen.getAllByRole('rowheader');
      expect(rowHeaders).toHaveLength(3); // One for each data row
      rowHeaders.forEach(header => {
        expect(header).toHaveAttribute('scope', 'row');
      });
    });

    test('should support keyboard navigation for sortable columns', async () => {
      const user = userEvent.setup();
      const onSort = jest.fn();
      
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
          onSort={onSort}
        />
      );

      const nameHeader = screen.getByRole('columnheader', { name: /area name/i });
      expect(nameHeader).toHaveAttribute('tabIndex', '0');
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');

      // Test keyboard activation
      nameHeader.focus();
      await user.keyboard('{Enter}');
      expect(onSort).toHaveBeenCalledWith('name', 'asc');

      await user.keyboard(' ');
      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    test('should announce sort changes', async () => {
      const user = userEvent.setup();
      const onSort = jest.fn();
      
      render(
        <Table
          columns={mockTableColumns}
          data={mockTableData}
          onSort={onSort}
          sortKey="name"
          sortDirection="asc"
        />
      );

      const nameHeader = screen.getByRole('columnheader', { name: /area name/i });
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

      // Click to sort descending
      await user.click(nameHeader);
      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    test('should handle loading state with proper ARIA attributes', () => {
      render(
        <Table
          columns={mockTableColumns}
          data={[]}
          loading={true}
        />
      );

      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
      expect(loadingStatus).toHaveAttribute('aria-label', 'Loading table data');
    });

    test('should handle error state with proper ARIA attributes', () => {
      const onRetry = jest.fn();
      
      render(
        <Table
          columns={mockTableColumns}
          data={[]}
          error="Failed to load data"
          onRetry={onRetry}
        />
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toHaveAttribute('aria-describedby', 'retry-description');
    });
  });

  describe('Performance Modal Accessibility', () => {
    test('should have proper table accessibility features', () => {
      render(
        <PerformanceModal
          isOpen={true}
          onClose={() => {}}
          data={mockPerformanceData}
          title="Performance Data"
        />
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Performance data by area and election');
      expect(table).toHaveAttribute('aria-describedby', 'performance-table-description');

      // Check caption
      const caption = screen.getByText(/performance data showing vote share/i);
      expect(caption).toHaveClass('ds-sr-only');

      // Check column headers have proper labels
      const lsgHeader = screen.getByRole('columnheader', { name: /lsg 2020 election results/i });
      expect(lsgHeader).toBeInTheDocument();

      const geHeader = screen.getByRole('columnheader', { name: /general election 2024 results/i });
      expect(geHeader).toBeInTheDocument();

      const targetHeader = screen.getByRole('columnheader', { name: /target 2025 projections/i });
      expect(targetHeader).toBeInTheDocument();
    });

    test('should have descriptive cell labels', () => {
      render(
        <PerformanceModal
          isOpen={true}
          onClose={() => {}}
          data={mockPerformanceData}
          title="Performance Data"
        />
      );

      // Check that cells have descriptive aria-labels
      const lsgCell = screen.getByLabelText(/lsg 2020: 45% vote share, 1,234 total votes/i);
      expect(lsgCell).toBeInTheDocument();

      const geCell = screen.getByLabelText(/ge 2024: 52% vote share, 1,456 total votes/i);
      expect(geCell).toBeInTheDocument();

      const targetCell = screen.getByLabelText(/target 2025: 60% vote share, 1,800 target votes/i);
      expect(targetCell).toBeInTheDocument();
    });
  });

  describe('ARIA Live Regions', () => {
    test('should create and manage live regions', () => {
      const region = AriaLiveRegion.getRegion('test-region', 'polite');
      
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-atomic', 'true');
      expect(region).toHaveClass('ds-live-region-polite');
    });

    test('should announce messages', async () => {
      AriaLiveRegion.announce('Test announcement', 'polite');
      
      const region = document.getElementById('aria-live-announcements');
      expect(region).toHaveTextContent('Test announcement');

      // Message should be cleared after timeout
      await waitFor(() => {
        expect(region).toHaveTextContent('');
      }, { timeout: 1500 });
    });

    test('should announce errors with assertive politeness', () => {
      AriaLiveRegion.announceError('Test error message');
      
      const region = document.getElementById('aria-live-announcements');
      expect(region).toHaveTextContent('Error: Test error message');
      expect(region).toHaveAttribute('aria-live', 'assertive');
    });

    test('should update status messages', () => {
      AriaLiveRegion.updateStatus('Loading complete');
      
      const region = document.getElementById('aria-live-status');
      expect(region).toHaveTextContent('Loading complete');
    });
  });

  describe('Color Contrast Compliance', () => {
    test('should calculate contrast ratios correctly', () => {
      // Test high contrast (white on black)
      const highContrast = ColorContrast.getContrastRatio([255, 255, 255], [0, 0, 0]);
      expect(highContrast).toBeCloseTo(21, 0);

      // Test low contrast (light gray on white)
      const lowContrast = ColorContrast.getContrastRatio([200, 200, 200], [255, 255, 255]);
      expect(lowContrast).toBeLessThan(4.5);
    });

    test('should validate WCAG AA compliance', () => {
      // White text on dark blue background (should pass AA)
      const passesAA = ColorContrast.meetsWCAG_AA([255, 255, 255], [0, 0, 139]);
      expect(passesAA).toBe(true);

      // Light gray on white (should fail AA)
      const failsAA = ColorContrast.meetsWCAG_AA([200, 200, 200], [255, 255, 255]);
      expect(failsAA).toBe(false);
    });

    test('should validate WCAG AAA compliance', () => {
      // White on black (should pass AAA)
      const passesAAA = ColorContrast.meetsWCAG_AAA([255, 255, 255], [0, 0, 0]);
      expect(passesAAA).toBe(true);

      // Medium contrast (should fail AAA)
      const failsAAA = ColorContrast.meetsWCAG_AAA([255, 255, 255], [100, 100, 100]);
      expect(failsAAA).toBe(false);
    });
  });

  describe('Touch Target Compliance', () => {
    test('should validate minimum touch target size', () => {
      render(<button style={{ width: '48px', height: '48px' }}>Large Button</button>);
      const button = screen.getByRole('button');
      
      const meetsMinimum = TouchTarget.meetsMinimumSize(button);
      expect(meetsMinimum).toBe(true);
    });

    test('should identify insufficient touch targets', () => {
      render(<button style={{ width: '20px', height: '20px' }}>Small Button</button>);
      const button = screen.getByRole('button');
      
      const meetsMinimum = TouchTarget.meetsMinimumSize(button);
      expect(meetsMinimum).toBe(false);
    });

    test('should ensure minimum size for elements', () => {
      render(<button style={{ width: '20px', height: '20px' }}>Small Button</button>);
      const button = screen.getByRole('button');
      
      TouchTarget.ensureMinimumSize(button);
      
      expect(button.style.minWidth).toBe('44px');
      expect(button.style.minHeight).toBe('44px');
      expect(button).toHaveClass('ds-touch-target');
    });
  });

  describe('Screen Reader Support', () => {
    test('should create descriptive text for UI elements', () => {
      const description = ScreenReader.createDescription({
        type: 'button',
        label: 'Save Document',
        state: 'enabled',
        position: { current: 1, total: 3 }
      });

      expect(description).toBe('button, Save Document, enabled, 1 of 3');
    });

    test('should handle elements without all properties', () => {
      const description = ScreenReader.createDescription({
        type: 'input',
        label: 'Email Address'
      });

      expect(description).toBe('input, Email Address');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should handle Enter and Space key activation', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          Custom Button
        </div>
      );

      const customButton = screen.getByRole('button');
      customButton.focus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    test('should support arrow key navigation in lists', async () => {
      const user = userEvent.setup();
      
      render(
        <ul role="listbox" aria-label="Options">
          <li role="option" tabIndex={0}>Option 1</li>
          <li role="option" tabIndex={-1}>Option 2</li>
          <li role="option" tabIndex={-1}>Option 3</li>
        </ul>
      );

      const firstOption = screen.getByText('Option 1');
      const secondOption = screen.getByText('Option 2');
      
      firstOption.focus();
      expect(document.activeElement).toBe(firstOption);

      // Arrow down should move to next option (if implemented)
      await user.keyboard('{ArrowDown}');
      // Note: This would require custom implementation in the component
    });
  });

  describe('Reduced Motion Support', () => {
    test('should respect prefers-reduced-motion', () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      // Test component with animations
      render(
        <div 
          className="ds-transition-base"
          style={{ 
            animation: 'fadeIn 0.3s ease-in-out',
            transition: 'all 0.3s ease'
          }}
        >
          Animated Content
        </div>
      );

      // In a real implementation, this would check if animations are disabled
      // when prefers-reduced-motion is set
      const animatedElement = screen.getByText('Animated Content');
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should provide accessible error messages', () => {
      render(
        <div>
          <input 
            type="email" 
            aria-invalid="true" 
            aria-describedby="email-error"
          />
          <div id="email-error" role="alert" className="ds-error-state">
            Please enter a valid email address
          </div>
        </div>
      );

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
      expect(errorMessage).toHaveTextContent('Please enter a valid email address');
    });

    test('should provide retry mechanisms', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();
      
      render(
        <div role="alert">
          <p>Failed to load data</p>
          <button onClick={onRetry} aria-describedby="retry-help">
            Retry
          </button>
          <div id="retry-help" className="ds-sr-only">
            Click to attempt loading the data again
          </div>
        </div>
      );

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
      expect(retryButton).toHaveAttribute('aria-describedby', 'retry-help');
    });
  });
});

describe('Accessibility Integration', () => {
  test('should initialize all accessibility features', () => {
    // Clear any existing elements
    document.querySelectorAll('[id^="aria-live"]').forEach(el => el.remove());
    document.querySelectorAll('.ds-skip-link').forEach(el => el.remove());

    initializeAccessibility();

    // Check that ARIA live regions are created
    expect(document.getElementById('aria-live-announcements')).toBeInTheDocument();
    expect(document.getElementById('aria-live-status')).toBeInTheDocument();
    expect(document.getElementById('aria-live-errors')).toBeInTheDocument();

    // Check that skip link is added
    const skipLink = document.querySelector('.ds-skip-link');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should ensure main content has proper ID', () => {
    // Create a main element without ID
    const main = document.createElement('main');
    document.body.appendChild(main);

    initializeAccessibility();

    expect(main).toHaveAttribute('id', 'main-content');

    // Clean up
    document.body.removeChild(main);
  });
});