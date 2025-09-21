import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { AlertCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useAccessibilityAnnouncements } from '../../utils/accessibility';
import { useSwipeGesture, useGPUAnimation, useReducedMotion, useTouchTargetSize } from '../../utils/mobilePerformance';

// Base table interfaces
export interface TableColumn<T = any> {
  key: string;
  header: ReactNode;
  accessor?: keyof T | ((item: T) => ReactNode);
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
  showScrollIndicator?: boolean;
  onRetry?: () => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  rowKey?: keyof T | ((item: T, index: number) => string | number);
  onRowClick?: (item: T, index: number) => void;
  renderRow?: (item: T, index: number) => ReactNode;
  footer?: ReactNode;
  caption?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

// Table container component
export const TableContainer: React.FC<{
  children: ReactNode;
  className?: string;
  showScrollIndicator?: boolean;
  ariaLabel?: string;
}> = ({ children, className = '', showScrollIndicator = true, ariaLabel }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldUseGPU } = useGPUAnimation();
  const { prefersReducedMotion } = useReducedMotion();

  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);

    // Hide scroll indicator after 3 seconds
    if (showScrollIndicator) {
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);

      return () => {
        window.removeEventListener('resize', checkScrollable);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [showScrollIndicator]);

  const handleScroll = () => {
    setShowIndicator(false);
  };

  return (
    <div className={`ds-table-container ${className}`} role="region" aria-label={ariaLabel}>
      <div 
        ref={containerRef}
        className={`
          relative overflow-x-auto -mx-4 sm:mx-0 ds-rounded-lg ds-momentum-scroll
          ${shouldUseGPU ? 'ds-gpu-accelerated' : ''}
        `}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
        tabIndex={0}
        role="group"
        aria-label="Scrollable table content"
      >
        {/* Scroll indicator overlay */}
        {isScrollable && showIndicator && showScrollIndicator && (
          <div 
            className="absolute top-0 right-0 z-20 bg-gradient-to-l from-slate-900/90 to-transparent px-4 py-2 ds-mobile-only"
            style={{
              ...(!prefersReducedMotion && {
                animation: 'ds-fade-in 300ms ease-out',
                ...(shouldUseGPU && { transform: 'translateZ(0)' })
              })
            }}
            aria-hidden="true"
          >
            <div className="flex items-center space-x-1 text-slate-400">
              <span className="text-xs">Scroll</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
        
        {children}
        
        {/* Mobile scroll instruction */}
        {isScrollable && (
          <div className="sm:hidden mt-4 text-center" role="status" aria-live="polite">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="text-xs">Swipe horizontally to view all data</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading skeleton component
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => {
  return (
    <div className="ds-table-wrapper">
      <div className="overflow-hidden ds-rounded-lg border ds-border-secondary">
        <table className="min-w-full ds-table">
          {showHeader && (
            <thead className="ds-table-header">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-3 sm:px-6 py-4">
                    <div className="ds-skeleton h-4 w-full"></div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-3 sm:px-6 py-4">
                    <div className="ds-skeleton h-4 w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Empty state component
export const TableEmptyState: React.FC<{
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}> = ({ 
  message = "No data available", 
  icon,
  action 
}) => {
  return (
    <div className="ds-table-wrapper" role="status" aria-live="polite">
      <div className="overflow-hidden ds-rounded-lg border ds-border-secondary">
        <div className="text-center ds-py-2xl ds-px-lg">
          <div className="flex flex-col items-center space-y-4">
            {icon || (
              <svg 
                className="w-16 h-16 text-slate-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            )}
            <div>
              <h3 className="ds-text-heading-2 text-slate-300 mb-2">No Data Found</h3>
              <p className="ds-text-body text-slate-400 max-w-md">
                {message}
              </p>
            </div>
            {action && (
              <div className="mt-4">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Error state component
export const TableErrorState: React.FC<{
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
}> = ({ 
  error, 
  onRetry, 
  retryLabel = "Try Again" 
}) => {
  return (
    <div className="ds-table-wrapper" role="alert" aria-live="assertive">
      <div className="overflow-hidden ds-rounded-lg border border-red-500/20 bg-red-500/5">
        <div className="text-center ds-py-2xl ds-px-lg">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-400" aria-hidden="true" />
            <div>
              <h3 className="ds-text-heading-2 text-red-300 mb-2">Error Loading Data</h3>
              <p className="ds-text-body text-red-200 max-w-md mb-4">
                {error}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="
                    ds-touch-target inline-flex items-center ds-gap-sm ds-px-lg ds-py-md
                    bg-red-600/20 text-red-400 ds-rounded-base border border-red-500/30
                    hover:bg-red-600/30 hover:border-red-500/50 ds-transition-base ds-focus-ring
                  "
                  aria-describedby="retry-description"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {retryLabel}
                </button>
              )}
              <div id="retry-description" className="ds-sr-only">
                Retry loading the table data
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main table component
export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "No data available",
  className = '',
  stickyHeader = true,
  showScrollIndicator = true,
  onRetry,
  onSort,
  sortKey,
  sortDirection,
  rowKey,
  onRowClick,
  renderRow,
  footer,
  caption,
  ariaLabel,
  ariaDescribedBy
}: TableProps<T>) => {
  const { announceTableSort, announceLoadingStart, announceLoadingComplete } = useAccessibilityAnnouncements();
  // Handle loading state
  if (loading) {
    React.useEffect(() => {
      announceLoadingStart('table data');
      return () => announceLoadingComplete('table data');
    }, [announceLoadingStart, announceLoadingComplete]);

    return (
      <TableContainer 
        className={className} 
        showScrollIndicator={false}
        ariaLabel={ariaLabel || "Loading table data"}
      >
        <div role="status" aria-live="polite" aria-label="Loading table data">
          <TableSkeleton 
            rows={5} 
            columns={columns.length} 
            showHeader={true}
          />
        </div>
      </TableContainer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <TableContainer 
        className={className} 
        showScrollIndicator={false}
        ariaLabel={ariaLabel || "Table error state"}
      >
        <TableErrorState 
          error={error} 
          onRetry={onRetry}
        />
      </TableContainer>
    );
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <TableContainer 
        className={className} 
        showScrollIndicator={false}
        ariaLabel={ariaLabel || "Empty table"}
      >
        <TableEmptyState message={emptyMessage} />
      </TableContainer>
    );
  }

  // Get row key function
  const getRowKey = (item: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(item, index);
    }
    if (rowKey && item[rowKey] !== undefined) {
      return String(item[rowKey]);
    }
    return index;
  };

  // Get cell content
  const getCellContent = (column: TableColumn<T>, item: T): ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    if (column.accessor && item[column.accessor] !== undefined) {
      return String(item[column.accessor]);
    }
    return '';
  };

  // Handle sort
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
    
    // Announce sort change to screen readers
    const columnName = typeof column.header === 'string' ? column.header : column.key;
    announceTableSort(columnName, newDirection);
  };

  return (
    <TableContainer 
      className={className} 
      showScrollIndicator={showScrollIndicator}
      ariaLabel={ariaLabel || `Data table with ${data.length} rows`}
    >
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden ds-rounded-lg border ds-border-secondary ds-shadow-md">
          <table 
            className="min-w-full ds-table ds-table-a11y" 
            role="table"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-rowcount={data.length + 1} // +1 for header
          >
            {caption && (
              <caption className="ds-sr-only-focusable">
                {caption}
              </caption>
            )}
            <thead className={`ds-table-header ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
              <tr role="row">
                {columns.map((column, index) => {
                  const isCurrentSort = sortKey === column.key;
                  const sortAriaSort = isCurrentSort 
                    ? (sortDirection === 'asc' ? 'ascending' : 'descending')
                    : column.sortable ? 'none' : undefined;
                  
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      role="columnheader"
                      aria-sort={sortAriaSort}
                      tabIndex={column.sortable ? 0 : undefined}
                      className={`
                        px-3 sm:px-6 py-4 ds-text-caption font-semibold text-slate-200 uppercase tracking-wider
                        ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                        ${column.sticky ? 'sticky left-0 bg-slate-800/90 backdrop-blur-sm z-20' : ''}
                        ${column.sortable ? 'cursor-pointer hover:bg-slate-700/50 ds-transition-base ds-focus-ring' : ''}
                        ${column.className || ''}
                      `}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth || (column.sticky ? '140px' : undefined)
                      }}
                      onClick={() => handleSort(column)}
                      onKeyDown={(e) => {
                        if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSort(column);
                        }
                      }}
                      aria-label={
                        column.sortable 
                          ? `${column.header}, sortable column, ${isCurrentSort ? `currently sorted ${sortDirection}` : 'not sorted'}`
                          : String(column.header)
                      }
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {column.sortable && (
                          <div className="flex flex-col" aria-hidden="true">
                            <ChevronUp 
                              className={`w-3 h-3 ${isCurrentSort && sortDirection === 'asc' ? 'text-blue-400' : 'text-slate-500'}`}
                            />
                            <ChevronDown 
                              className={`w-3 h-3 -mt-1 ${isCurrentSort && sortDirection === 'desc' ? 'text-blue-400' : 'text-slate-500'}`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
              {data.map((item, index) => {
                const key = getRowKey(item, index);
                const rowNumber = index + 1;
                
                if (renderRow) {
                  return (
                    <React.Fragment key={key}>
                      {renderRow(item, index)}
                    </React.Fragment>
                  );
                }

                return (
                  <tr 
                    key={key}
                    role="row"
                    aria-rowindex={rowNumber + 1} // +1 for header
                    tabIndex={onRowClick ? 0 : undefined}
                    className={`
                      hover:bg-slate-800/40 ds-transition-base group
                      ${onRowClick ? 'cursor-pointer ds-focus-ring' : ''}
                    `}
                    onClick={() => onRowClick?.(item, index)}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(item, index);
                      }
                    }}
                    aria-label={onRowClick ? `Row ${rowNumber}, clickable` : `Row ${rowNumber}`}
                  >
                    {columns.map((column, colIndex) => {
                      const isFirstColumn = colIndex === 0;
                      return (
                        <td
                          key={column.key}
                          role={isFirstColumn ? 'rowheader' : 'gridcell'}
                          aria-describedby={column.key}
                          className={`
                            px-3 sm:px-6 py-4 ds-text-small
                            ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                            ${column.sticky ? 'sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 group-hover:bg-slate-800/90' : ''}
                            ${column.className || ''}
                          `}
                          style={{
                            width: column.width,
                            minWidth: column.minWidth
                          }}
                        >
                          {getCellContent(column, item)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {footer && (
              <tfoot>
                {footer}
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </TableContainer>
  );
};

export default Table;