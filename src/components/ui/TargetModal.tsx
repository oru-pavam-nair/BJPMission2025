import React from 'react';
import Modal from './Modal';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorBoundary';

interface TargetData {
  panchayat: { total: number; targetWin: number; targetOpposition: number };
  municipality: { total: number; targetWin: number; targetOpposition: number };
  corporation: { total: number; targetWin: number; targetOpposition: number };
}

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, TargetData>;
  title: string;
  showGrandTotal?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const TargetModal: React.FC<TargetModalProps> = ({
  isOpen,
  onClose,
  data,
  title,
  showGrandTotal = true,
  isLoading = false,
  error = null,
  onRetry
}) => {
  // Calculate grand totals
  const calculateGrandTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(data).forEach(item => {
      totals.panchayat.total += item.panchayat.total;
      totals.panchayat.targetWin += item.panchayat.targetWin;
      totals.panchayat.targetOpposition += item.panchayat.targetOpposition;
      
      totals.municipality.total += item.municipality.total;
      totals.municipality.targetWin += item.municipality.targetWin;
      totals.municipality.targetOpposition += item.municipality.targetOpposition;
      
      totals.corporation.total += item.corporation.total;
      totals.corporation.targetWin += item.corporation.targetWin;
      totals.corporation.targetOpposition += item.corporation.targetOpposition;
    });

    return totals;
  };

  const grandTotals = showGrandTotal ? calculateGrandTotals() : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="p-4 sm:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingIndicator
              size="md"
              variant="spinner"
              color="primary"
              text="Loading target data..."
            />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorDisplay
            error={new Error(error)}
            title="Failed to Load Target Data"
            onRetry={onRetry}
            className="my-8"
          />
        )}

        {/* Content - only show when not loading and no error */}
        {!isLoading && !error && (
        <>
        {/* Mobile-optimized table container */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden rounded-lg border border-slate-700/50">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider sticky left-0 bg-slate-800/50 z-10">
                      Area
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider" colSpan={3}>
                      Panchayat
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider" colSpan={3}>
                      Municipality
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider" colSpan={3}>
                      Corporation
                    </th>
                  </tr>
                  <tr className="bg-slate-800/30">
                    <th className="px-3 sm:px-6 py-2 sticky left-0 bg-slate-800/30 z-10"></th>
                    <th className="px-2 py-2 text-xs text-slate-400">Total</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Win</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Opp</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Total</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Win</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Opp</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Total</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Win</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Opp</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
                  {Object.entries(data).map(([name, item], index) => (
                    <tr 
                      key={index}
                      className="hover:bg-slate-800/30 ds-transition-base"
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100 sticky left-0 bg-slate-900/50 z-10">
                        <div className="max-w-[120px] sm:max-w-none truncate" title={name}>
                          {name}
                        </div>
                      </td>
                      
                      {/* Panchayat columns */}
                      <td className="px-2 py-4 text-center text-sm text-slate-300">
                        {item.panchayat.total}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-green-400">
                        {item.panchayat.targetWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-red-400">
                        {item.panchayat.targetOpposition}
                      </td>
                      
                      {/* Municipality columns */}
                      <td className="px-2 py-4 text-center text-sm text-slate-300">
                        {item.municipality.total}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-green-400">
                        {item.municipality.targetWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-red-400">
                        {item.municipality.targetOpposition}
                      </td>
                      
                      {/* Corporation columns */}
                      <td className="px-2 py-4 text-center text-sm text-slate-300">
                        {item.corporation.total}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-green-400">
                        {item.corporation.targetWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-red-400">
                        {item.corporation.targetOpposition}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Grand Total Row */}
                  {grandTotals && (
                    <tr className="bg-slate-800/50 border-t-2 border-slate-600">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-100 sticky left-0 bg-slate-800/50 z-10">
                        Grand Total
                      </td>
                      
                      {/* Panchayat totals */}
                      <td className="px-2 py-4 text-center text-sm font-bold text-slate-200">
                        {grandTotals.panchayat.total}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-bold text-green-400">
                        {grandTotals.panchayat.targetWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-bold text-red-400">
                        {grandTotals.panchayat.targetOpposition}
                      </td>
                      
                      {/* Municipality totals */}
                      <td className="px-2 py-4 text-center text-sm font-bold text-slate-200">
                        {grandTotals.municipality.total}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-bold text-green-400">
                        {grandTotals.municipality.targetWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-bold text-red-400">
                        {grandTotals.municipality.targetOpposition}
                      </td>
                      
                      {/* Corporation totals */}
                      <td className="px-2 py-4 text-center text-sm font-bold text-slate-200">
                        {grandTotals.corporation.total}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-bold text-green-400">
                        {grandTotals.corporation.targetWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-bold text-red-400">
                        {grandTotals.corporation.targetOpposition}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile scroll indicator */}
        <div className="sm:hidden mt-4 text-center">
          <p className="text-xs text-slate-400">
            ← Swipe to see more data →
          </p>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span className="text-slate-300">Target Win</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-slate-300">Target Opposition</span>
          </div>
        </div>
        </>
        )}
      </div>
    </Modal>
  );
};

export default TargetModal;