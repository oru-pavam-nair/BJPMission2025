import React from 'react';
import { Table, TableColumn } from './Table';

export interface PerformanceData {
  name: string;
  lsg2020: { vs: string; votes: string };
  ge2024: { vs: string; votes: string };
  target2025: { vs: string; votes: string };
}

interface PerformanceTableProps {
  data: PerformanceData[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  grandTotal?: PerformanceData | null;
  className?: string;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({
  data,
  loading = false,
  error = null,
  onRetry,
  grandTotal,
  className = ''
}) => {
  const columns: TableColumn<PerformanceData>[] = [
    {
      key: 'name',
      header: (
        <div className="flex flex-col">
          <span>Area Name</span>
          <span className="text-[10px] text-slate-400 normal-case font-normal">Location</span>
        </div>
      ),
      accessor: 'name',
      sticky: true,
      minWidth: '140px',
      className: 'font-medium text-slate-100',
    },
    {
      key: 'lsg2020',
      header: (
        <div className="flex flex-col space-y-1">
          <span className="text-blue-300">LSG 2020</span>
          <span className="text-[10px] text-slate-400 normal-case font-normal">Vote Share | Votes</span>
        </div>
      ),
      accessor: (item) => (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-bold text-blue-400 ds-transition-base group-hover:text-blue-300">
            {item.lsg2020.vs}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {item.lsg2020.votes}
          </span>
        </div>
      ),
      align: 'center',
      minWidth: '120px',
    },
    {
      key: 'ge2024',
      header: (
        <div className="flex flex-col space-y-1">
          <span className="text-green-300">GE 2024</span>
          <span className="text-[10px] text-slate-400 normal-case font-normal">Vote Share | Votes</span>
        </div>
      ),
      accessor: (item) => (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-bold text-green-400 ds-transition-base group-hover:text-green-300">
            {item.ge2024.vs}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {item.ge2024.votes}
          </span>
        </div>
      ),
      align: 'center',
      minWidth: '120px',
    },
    {
      key: 'target2025',
      header: (
        <div className="flex flex-col space-y-1">
          <span className="text-amber-300">Target 2025</span>
          <span className="text-[10px] text-slate-400 normal-case font-normal">Vote Share | Votes</span>
        </div>
      ),
      accessor: (item) => (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-bold text-amber-400 ds-transition-base group-hover:text-amber-300">
            {item.target2025.vs}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {item.target2025.votes}
          </span>
        </div>
      ),
      align: 'center',
      minWidth: '120px',
    },
  ];

  // Render custom row for area name with index
  const renderRow = (item: PerformanceData, index: number) => (
    <tr className="hover:bg-slate-800/40 ds-transition-base group">
      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-slate-100 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10 group-hover:bg-slate-800/90">
        <div className="max-w-[120px] sm:max-w-[200px]">
          <div className="truncate font-semibold" title={item.name}>
            {item.name}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Area {index + 1}
          </div>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-center">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-bold text-blue-400 ds-transition-base group-hover:text-blue-300">
            {item.lsg2020.vs}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {item.lsg2020.votes}
          </span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-center">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-bold text-green-400 ds-transition-base group-hover:text-green-300">
            {item.ge2024.vs}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {item.ge2024.votes}
          </span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 text-center">
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
  );

  // Footer with grand total if provided
  const footer = grandTotal ? (
    <tr className="bg-gradient-to-r from-slate-800/70 to-slate-700/70 border-t-2 border-blue-500/50">
      <td className="px-3 sm:px-6 py-5 text-sm font-bold text-slate-100 sticky left-0 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Grand Total</span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-5 text-center">
        <div className="flex flex-col space-y-1">
          <span className="text-base font-bold text-blue-300">
            {grandTotal.lsg2020.vs}
          </span>
          <span className="text-xs text-slate-200 font-semibold">
            {grandTotal.lsg2020.votes}
          </span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-5 text-center">
        <div className="flex flex-col space-y-1">
          <span className="text-base font-bold text-green-300">
            {grandTotal.ge2024.vs}
          </span>
          <span className="text-xs text-slate-200 font-semibold">
            {grandTotal.ge2024.votes}
          </span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-5 text-center">
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
  ) : undefined;

  return (
    <div className={className}>
      {/* Data summary */}
      <div className="mb-6">
        <div className="ds-text-small ds-text-secondary mb-4">
          Performance data showing vote share percentages and total votes across different elections
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="ds-text-caption">
            {loading ? 'Loading...' : `Showing ${data.length} ${data.length === 1 ? 'area' : 'areas'}`}
          </span>
          {grandTotal && !loading && (
            <span className="ds-text-caption ds-bg-primary/10 px-2 py-1 ds-rounded-sm">
              Total Summary Available
            </span>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyMessage="No performance data available"
        renderRow={renderRow}
        footer={footer}
        rowKey="name"
        stickyHeader={true}
        showScrollIndicator={true}
      />

      {/* Data legend */}
      {!loading && !error && data.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-400">LSG 2020</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-400">GE 2024</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-slate-400">Target 2025</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTable;