import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useAccessibilityAnnouncements } from '../../utils/accessibility';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorBoundary';
import { SkeletonTable } from './SkeletonUI';

interface PerformanceData {
  name: string;
  lsg2020: { vs: string; votes: string };
  ge2024: { vs: string; votes: string };
  target2025: { vs: string; votes: string };
}

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PerformanceData[];
  title: string;
  grandTotal?: PerformanceData | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({
  isOpen,
  onClose,
  data,
  title,
  grandTotal,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { announceLoadingComplete } = useAccessibilityAnnouncements();

  // Check if table is scrollable and handle scroll indicators
  useEffect(() => {
    const checkScrollable = () => {
      if (tableContainerRef.current) {
        const { scrollWidth, clientWidth } = tableContainerRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };

    if (isOpen) {
      checkScrollable();
      window.addEventListener('resize', checkScrollable);
      
      // Hide scroll indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowScrollIndicator(false);
      }, 3000);

      return () => {
        window.removeEventListener('resize', checkScrollable);
        clearTimeout(timer);
      };
    }
  }, [isOpen, data]);

  // Handle scroll events to show/hide indicators
  const handleScroll = () => {
    setShowScrollIndicator(false);
  };

  // Announce when data is loaded
  useEffect(() => {
    if (isOpen && data.length > 0) {
      announceLoadingComplete(`performance data for ${data.length} areas`);
    }
  }, [isOpen, data.length, announceLoadingComplete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      description={`Performance data showing vote share percentages and total votes for ${data.length} areas across different elections`}
      ariaLabel={`${title} - Performance data table`}
    >
      {/* Modal Content with proper spacing */}
      <div className="ds-modal-body">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingIndicator
              size="md"
              variant="spinner"
              color="primary"
              text="Loading performance data..."
            />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorDisplay
            error={new Error(error)}
            title="Failed to Load Performance Data"
            onRetry={onRetry}
            className="my-8"
          />
        )}

        {/* Content - only show when not loading and no error */}
        {!isLoading && !error && (
          <>
            {/* Performance Summary Header */}
            <div className="mb-6">
          <div className="ds-text-small ds-text-secondary mb-4">
            Performance data showing vote share percentages and total votes across different elections
          </div>
          
          {/* Data count indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="ds-text-caption">
              Showing {data.length} {data.length === 1 ? 'area' : 'areas'}
            </span>
            {grandTotal && (
              <span className="ds-text-caption ds-bg-primary/10 px-2 py-1 ds-rounded-sm">
                Total Summary Available
              </span>
            )}
          </div>
        </div>

        {/* Enhanced table container with better mobile optimization */}
        <div 
          ref={tableContainerRef}
          className="relative overflow-x-auto -mx-4 sm:mx-0 ds-rounded-lg"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent'
          }}
          role="region"
          aria-label="Performance data table"
          tabIndex={0}
        >
          {/* Scroll indicator overlay */}
          {isScrollable && showScrollIndicator && (
            <div 
              className="absolute top-0 right-0 z-20 bg-gradient-to-l from-slate-900/90 to-transparent px-4 py-2 ds-mobile-only"
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

          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden ds-rounded-lg border ds-border-secondary ds-shadow-md">
              <table 
                className="min-w-full ds-table ds-table-a11y" 
                role="table"
                aria-label="Performance data by area and election"
                aria-describedby="performance-table-description"
              >
                <caption id="performance-table-description" className="ds-sr-only">
                  Performance data showing vote share percentages and total votes for {data.length} areas across LSG 2020, GE 2024, and Target 2025 elections
                </caption>
                <thead className="ds-table-header">
                  <tr role="row">
                    <th 
                      scope="col"
                      className="px-3 sm:px-6 py-4 text-left ds-text-caption font-semibold text-slate-200 uppercase tracking-wider sticky left-0 bg-slate-800/90 backdrop-blur-sm z-10 min-w-[140px]"
                    >
                      <div className="flex flex-col">
                        <span>Area Name</span>
                        <span className="text-[10px] text-slate-400 normal-case font-normal">Location</span>
                      </div>
                    </th>
                    <th 
                      scope="col"
                      className="px-3 sm:px-6 py-4 text-center ds-text-caption font-semibold text-slate-200 uppercase tracking-wider min-w-[120px]"
                      aria-label="LSG 2020 election results"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-blue-300">LSG 2020</span>
                        <span className="text-[10px] text-slate-400 normal-case font-normal">Vote Share | Votes</span>
                      </div>
                    </th>
                    <th 
                      scope="col"
                      className="px-3 sm:px-6 py-4 text-center ds-text-caption font-semibold text-slate-200 uppercase tracking-wider min-w-[120px]"
                      aria-label="General Election 2024 results"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-green-300">GE 2024</span>
                        <span className="text-[10px] text-slate-400 normal-case font-normal">Vote Share | Votes</span>
                      </div>
                    </th>
                    <th 
                      scope="col"
                      className="px-3 sm:px-6 py-4 text-center ds-text-caption font-semibold text-slate-200 uppercase tracking-wider min-w-[120px]"
                      aria-label="Target 2025 projections"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-amber-300">Target 2025</span>
                        <span className="text-[10px] text-slate-400 normal-case font-normal">Vote Share | Votes</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
                  {data.map((item, index) => (
                    <tr 
                      key={index}
                      role="row"
                      className="hover:bg-slate-800/40 ds-transition-base group"
                      aria-rowindex={index + 2}
                    >
                      <th 
                        scope="row"
                        className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-100 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 group-hover:bg-slate-800/90"
                      >
                        <div className="max-w-[120px] sm:max-w-[200px]">
                          <div className="truncate font-semibold" title={item.name}>
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Area {index + 1}
                          </div>
                        </div>
                      </th>
                      <td 
                        className="px-3 sm:px-6 py-4 text-center"
                        aria-label={`LSG 2020: ${item.lsg2020.vs} vote share, ${item.lsg2020.votes} total votes`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-bold text-blue-400 ds-transition-base group-hover:text-blue-300">
                            {item.lsg2020.vs}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {item.lsg2020.votes}
                          </span>
                        </div>
                      </td>
                      <td 
                        className="px-3 sm:px-6 py-4 text-center"
                        aria-label={`GE 2024: ${item.ge2024.vs} vote share, ${item.ge2024.votes} total votes`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-bold text-green-400 ds-transition-base group-hover:text-green-300">
                            {item.ge2024.vs}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {item.ge2024.votes}
                          </span>
                        </div>
                      </td>
                      <td 
                        className="px-3 sm:px-6 py-4 text-center"
                        aria-label={`Target 2025: ${item.target2025.vs} vote share, ${item.target2025.votes} target votes`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-bold text-amber-400 ds-transition-base group-hover:text-amber-300">
                            {item.target2025.vs}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {item.target2025.votes}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Enhanced Grand Total Row */}
                  {grandTotal && (
                    <tr 
                      className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 border-t-2 border-blue-500/50"
                      role="row"
                      aria-label="Grand total row"
                    >
                      <th 
                        scope="row"
                        className="px-3 sm:px-6 py-5 text-sm font-bold text-slate-100 sticky left-0 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm z-10"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                          <span>Grand Total</span>
                        </div>
                      </th>
                      <td 
                        className="px-3 sm:px-6 py-5 text-center"
                        aria-label={`LSG 2020 total: ${grandTotal.lsg2020.vs} vote share, ${grandTotal.lsg2020.votes} total votes`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-base font-bold text-blue-300">
                            {grandTotal.lsg2020.vs}
                          </span>
                          <span className="text-xs text-slate-200 font-semibold">
                            {grandTotal.lsg2020.votes}
                          </span>
                        </div>
                      </td>
                      <td 
                        className="px-3 sm:px-6 py-5 text-center"
                        aria-label={`GE 2024 total: ${grandTotal.ge2024.vs} vote share, ${grandTotal.ge2024.votes} total votes`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-base font-bold text-green-300">
                            {grandTotal.ge2024.vs}
                          </span>
                          <span className="text-xs text-slate-200 font-semibold">
                            {grandTotal.ge2024.votes}
                          </span>
                        </div>
                      </td>
                      <td 
                        className="px-3 sm:px-6 py-5 text-center"
                        aria-label={`Target 2025 total: ${grandTotal.target2025.vs} vote share, ${grandTotal.target2025.votes} target votes`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="text-base font-bold text-amber-300">
                            {grandTotal.target2025.vs}
                          </span>
                          <span className="text-xs text-slate-200 font-semibold">
                            {grandTotal.target2025.votes}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced mobile scroll indicator and touch instructions */}
        <div className="mt-6 space-y-3">
          {isScrollable && (
            <div className="sm:hidden flex items-center justify-center space-x-2 text-slate-400" role="status" aria-live="polite">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="text-xs">Swipe horizontally to view all data</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          )}
          
          {/* Data legend */}
          <div className="flex flex-wrap gap-4 justify-center text-xs" role="group" aria-label="Data legend">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" aria-hidden="true"></div>
              <span className="text-slate-400">LSG 2020</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true"></div>
              <span className="text-slate-400">GE 2024</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full" aria-hidden="true"></div>
              <span className="text-slate-400">Target 2025</span>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PerformanceModal;