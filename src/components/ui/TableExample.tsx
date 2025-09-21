import React, { useState } from 'react';
import { Table, PerformanceTable, TargetTable } from './index';

// Example component demonstrating the responsive table system
const TableExample: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sample data for basic table
    const basicColumns = [
        {
            key: 'id',
            header: 'ID',
            accessor: 'id' as const,
            width: '80px',
            sortable: true,
        },
        {
            key: 'name',
            header: 'Name',
            accessor: 'name' as const,
            sticky: true,
            minWidth: '150px',
            sortable: true,
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (item: any) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {item.status}
                </span>
            ),
            align: 'center' as const,
            width: '100px',
        },
        {
            key: 'value',
            header: 'Value',
            accessor: 'value' as const,
            align: 'right' as const,
            sortable: true,
        },
    ];

    const basicData = [
        { id: 1, name: 'Item One', status: 'active', value: 1250 },
        { id: 2, name: 'Item Two', status: 'inactive', value: 890 },
        { id: 3, name: 'Item Three', status: 'active', value: 2100 },
        { id: 4, name: 'Item Four', status: 'active', value: 750 },
    ];

    // Sample performance data
    const performanceData = [
        {
            name: 'Thiruvananthapuram',
            lsg2020: { vs: '42.5%', votes: '125,430' },
            ge2024: { vs: '45.8%', votes: '142,680' },
            target2025: { vs: '50.0%', votes: '165,000' }
        },
        {
            name: 'Kollam',
            lsg2020: { vs: '38.2%', votes: '98,750' },
            ge2024: { vs: '41.6%', votes: '108,920' },
            target2025: { vs: '46.5%', votes: '125,500' }
        },
        {
            name: 'Kottayam',
            lsg2020: { vs: '35.8%', votes: '87,340' },
            ge2024: { vs: '39.1%', votes: '95,680' },
            target2025: { vs: '44.0%', votes: '110,000' }
        }
    ];

    const performanceGrandTotal = {
        name: 'Total',
        lsg2020: { vs: '38.8%', votes: '311,520' },
        ge2024: { vs: '42.2%', votes: '347,280' },
        target2025: { vs: '46.8%', votes: '400,500' }
    };

    // Sample target data
    const targetData = {
        'Thiruvananthapuram': {
            panchayat: { total: 15, targetWin: 10, targetOpposition: 5 },
            municipality: { total: 8, targetWin: 5, targetOpposition: 3 },
            corporation: { total: 3, targetWin: 2, targetOpposition: 1 }
        },
        'Kollam': {
            panchayat: { total: 12, targetWin: 7, targetOpposition: 5 },
            municipality: { total: 6, targetWin: 3, targetOpposition: 3 },
            corporation: { total: 2, targetWin: 1, targetOpposition: 1 }
        },
        'Kottayam': {
            panchayat: { total: 10, targetWin: 6, targetOpposition: 4 },
            municipality: { total: 4, targetWin: 2, targetOpposition: 2 },
            corporation: { total: 1, targetWin: 1, targetOpposition: 0 }
        }
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        console.log(`Sorting by ${key} in ${direction} order`);
    };

    const handleRowClick = (item: any, index: number) => {
        console.log('Row clicked:', item, index);
    };

    const simulateLoading = () => {
        setLoading(true);
        setError(null);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    const simulateError = () => {
        setLoading(false);
        setError('Failed to load data. Please try again.');
    };

    const handleRetry = () => {
        setError(null);
        simulateLoading();
    };

    return (
        <div className="ds-container ds-py-2xl space-y-8">
            <div>
                <h1 className="ds-text-heading-1 mb-4">Responsive Table System Examples</h1>
                <p className="ds-text-body ds-text-secondary mb-8">
                    Demonstration of the comprehensive table system with loading states, error handling,
                    and responsive design.
                </p>
            </div>

            {/* Control buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
                <button
                    onClick={simulateLoading}
                    className="ds-touch-target px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ds-transition-base"
                >
                    Simulate Loading
                </button>
                <button
                    onClick={simulateError}
                    className="ds-touch-target px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ds-transition-base"
                >
                    Simulate Error
                </button>
                <button
                    onClick={() => { setLoading(false); setError(null); }}
                    className="ds-touch-target px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ds-transition-base"
                >
                    Reset
                </button>
            </div>

            {/* Basic Table Example */}
            <section>
                <h2 className="ds-text-heading-2 mb-4">Basic Responsive Table</h2>
                <p className="ds-text-small ds-text-secondary mb-4">
                    Features: Sticky columns, sorting, row clicks, horizontal scroll on mobile
                </p>
                <Table
                    columns={basicColumns}
                    data={loading ? [] : error ? [] : basicData}
                    loading={loading}
                    error={error}
                    onRetry={handleRetry}
                    onSort={handleSort}
                    onRowClick={handleRowClick}
                    emptyMessage="No items found in the system"
                    className="mb-4"
                />
            </section>

            {/* Performance Table Example */}
            <section>
                <h2 className="ds-text-heading-2 mb-4">Performance Data Table</h2>
                <p className="ds-text-small ds-text-secondary mb-4">
                    Specialized table for election performance data with grand totals
                </p>
                <PerformanceTable
                    data={loading ? [] : error ? [] : performanceData}
                    loading={loading}
                    error={error}
                    onRetry={handleRetry}
                    grandTotal={!loading && !error ? performanceGrandTotal : undefined}
                    className="mb-4"
                />
            </section>

            {/* Target Table Example */}
            <section>
                <h2 className="ds-text-heading-2 mb-4">Target Data Table</h2>
                <p className="ds-text-small ds-text-secondary mb-4">
                    Complex table with grouped headers and calculated totals
                </p>
                <TargetTable
                    data={loading ? {} : error ? {} : targetData}
                    loading={loading}
                    error={error}
                    onRetry={handleRetry}
                    showGrandTotal={true}
                    className="mb-4"
                />
            </section>

            {/* Mobile Instructions */}
            <section className="ds-card">
                <h3 className="ds-text-heading-2 mb-4">Mobile Usage Instructions</h3>
                <ul className="ds-text-small space-y-2">
                    <li>• Tables automatically become horizontally scrollable on mobile devices</li>
                    <li>• Sticky columns remain visible while scrolling horizontally</li>
                    <li>• Touch targets meet accessibility requirements (44px minimum)</li>
                    <li>• Scroll indicators help users understand when content extends beyond viewport</li>
                    <li>• Loading states prevent user confusion during data fetching</li>
                    <li>• Error states provide clear feedback and retry options</li>
                </ul>
            </section>
        </div>
    );
};

export default TableExample;