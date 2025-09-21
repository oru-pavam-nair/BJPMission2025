import React from 'react';
import { Table, TableColumn } from './Table';

export interface TargetData {
  panchayat: { total: number; targetWin: number; targetOpposition: number };
  municipality: { total: number; targetWin: number; targetOpposition: number };
  corporation: { total: number; targetWin: number; targetOpposition: number };
}

interface TargetTableProps {
  data: Record<string, TargetData>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  showGrandTotal?: boolean;
  className?: string;
}

interface FlatTargetData {
  name: string;
  panchayatTotal: number;
  panchayatWin: number;
  panchayatOpp: number;
  municipalityTotal: number;
  municipalityWin: number;
  municipalityOpp: number;
  corporationTotal: number;
  corporationWin: number;
  corporationOpp: number;
}

const TargetTable: React.FC<TargetTableProps> = ({
  data,
  loading = false,
  error = null,
  onRetry,
  showGrandTotal = true,
  className = ''
}) => {
  // Transform data for table consumption
  const flatData: FlatTargetData[] = Object.entries(data).map(([name, item]) => ({
    name,
    panchayatTotal: item.panchayat.total,
    panchayatWin: item.panchayat.targetWin,
    panchayatOpp: item.panchayat.targetOpposition,
    municipalityTotal: item.municipality.total,
    municipalityWin: item.municipality.targetWin,
    municipalityOpp: item.municipality.targetOpposition,
    corporationTotal: item.corporation.total,
    corporationWin: item.corporation.targetWin,
    corporationOpp: item.corporation.targetOpposition,
  }));

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

  const columns: TableColumn<FlatTargetData>[] = [
    {
      key: 'name',
      header: 'Area',
      accessor: 'name',
      sticky: true,
      minWidth: '120px',
      className: 'font-medium text-slate-100',
    },
    // Panchayat columns
    {
      key: 'panchayatTotal',
      header: 'Total',
      accessor: 'panchayatTotal',
      align: 'center',
      minWidth: '60px',
      className: 'text-slate-300',
    },
    {
      key: 'panchayatWin',
      header: 'Win',
      accessor: (item) => (
        <span className="font-semibold text-green-400">{item.panchayatWin}</span>
      ),
      align: 'center',
      minWidth: '60px',
    },
    {
      key: 'panchayatOpp',
      header: 'Opp',
      accessor: (item) => (
        <span className="font-semibold text-red-400">{item.panchayatOpp}</span>
      ),
      align: 'center',
      minWidth: '60px',
    },
    // Municipality columns
    {
      key: 'municipalityTotal',
      header: 'Total',
      accessor: 'municipalityTotal',
      align: 'center',
      minWidth: '60px',
      className: 'text-slate-300',
    },
    {
      key: 'municipalityWin',
      header: 'Win',
      accessor: (item) => (
        <span className="font-semibold text-green-400">{item.municipalityWin}</span>
      ),
      align: 'center',
      minWidth: '60px',
    },
    {
      key: 'municipalityOpp',
      header: 'Opp',
      accessor: (item) => (
        <span className="font-semibold text-red-400">{item.municipalityOpp}</span>
      ),
      align: 'center',
      minWidth: '60px',
    },
    // Corporation columns
    {
      key: 'corporationTotal',
      header: 'Total',
      accessor: 'corporationTotal',
      align: 'center',
      minWidth: '60px',
      className: 'text-slate-300',
    },
    {
      key: 'corporationWin',
      header: 'Win',
      accessor: (item) => (
        <span className="font-semibold text-green-400">{item.corporationWin}</span>
      ),
      align: 'center',
      minWidth: '60px',
    },
    {
      key: 'corporationOpp',
      header: 'Opp',
      accessor: (item) => (
        <span className="font-semibold text-red-400">{item.corporationOpp}</span>
      ),
      align: 'center',
      minWidth: '60px',
    },
  ];

  // Custom header with grouped columns
  const renderCustomTable = () => {
    if (loading || error || flatData.length === 0) {
      return (
        <Table
          columns={columns}
          data={flatData}
          loading={loading}
          error={error}
          onRetry={onRetry}
          emptyMessage="No target data available"
          rowKey="name"
          stickyHeader={true}
          showScrollIndicator={true}
        />
      );
    }

    return (
      <div className="ds-table-container">
        <div className="relative overflow-x-auto -mx-4 sm:mx-0 ds-rounded-lg">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden ds-rounded-lg border ds-border-secondary ds-shadow-md">
              <table className="min-w-full ds-table">
                {/* Custom grouped header */}
                <thead className="ds-table-header sticky top-0 z-10">
                  <tr>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider sticky left-0 bg-slate-800/90 backdrop-blur-sm z-20"
                      rowSpan={2}
                    >
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
                    {/* Panchayat sub-headers */}
                    <th className="px-2 py-2 text-xs text-slate-400">Total</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Win</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Opp</th>
                    {/* Municipality sub-headers */}
                    <th className="px-2 py-2 text-xs text-slate-400">Total</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Win</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Opp</th>
                    {/* Corporation sub-headers */}
                    <th className="px-2 py-2 text-xs text-slate-400">Total</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Win</th>
                    <th className="px-2 py-2 text-xs text-slate-400">Opp</th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
                  {flatData.map((item, index) => (
                    <tr 
                      key={item.name}
                      className="hover:bg-slate-800/30 ds-transition-base"
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10">
                        <div className="max-w-[120px] sm:max-w-none truncate" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      
                      {/* Panchayat columns */}
                      <td className="px-2 py-4 text-center text-sm text-slate-300">
                        {item.panchayatTotal}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-green-400">
                        {item.panchayatWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-red-400">
                        {item.panchayatOpp}
                      </td>
                      
                      {/* Municipality columns */}
                      <td className="px-2 py-4 text-center text-sm text-slate-300">
                        {item.municipalityTotal}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-green-400">
                        {item.municipalityWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-red-400">
                        {item.municipalityOpp}
                      </td>
                      
                      {/* Corporation columns */}
                      <td className="px-2 py-4 text-center text-sm text-slate-300">
                        {item.corporationTotal}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-green-400">
                        {item.corporationWin}
                      </td>
                      <td className="px-2 py-4 text-center text-sm font-semibold text-red-400">
                        {item.corporationOpp}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Grand Total Row */}
                  {grandTotals && (
                    <tr className="bg-slate-800/50 border-t-2 border-slate-600">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-100 sticky left-0 bg-slate-800/90 backdrop-blur-sm z-10">
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
          
          {/* Mobile scroll instruction */}
          <div className="sm:hidden mt-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="text-xs">Swipe horizontally to view all data</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {renderCustomTable()}

      {/* Legend */}
      {!loading && !error && flatData.length > 0 && (
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
      )}
    </div>
  );
};

export default TargetTable;