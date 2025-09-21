/**
 * Skeleton UI Components for Loading States
 * Provides consistent loading animations and placeholders
 * Requirements: 8.3, 8.4
 */

import React from 'react';
import { useReducedMotion } from '../../utils/mobilePerformance';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

/**
 * Base skeleton component with accessibility support
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  animate = true
}) => {
  const { prefersReducedMotion } = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`
        bg-slate-700/50 
        ${shouldAnimate ? 'animate-pulse' : ''} 
        ${rounded ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
      style={style}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    />
  );
};

/**
 * Skeleton for text content
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 1, className = '', lastLineWidth = '75%' }) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text content">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          className="h-4"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for table rows
 */
export const SkeletonTableRow: React.FC<{
  columns?: number;
  className?: string;
}> = ({ columns = 4, className = '' }) => {
  return (
    <tr className={`border-b border-slate-700/30 ${className}`} role="status" aria-label="Loading table row">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-3 sm:px-6 py-4">
          <Skeleton height="1rem" className="h-4" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Skeleton for complete table
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ rows = 5, columns = 4, showHeader = true, className = '' }) => {
  return (
    <div 
      className={`overflow-hidden rounded-lg border border-slate-700/50 ${className}`}
      role="status" 
      aria-label="Loading table data"
    >
      <table className="min-w-full">
        {showHeader && (
          <thead className="bg-slate-800/50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-3 sm:px-6 py-4">
                  <Skeleton height="1rem" className="h-4" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-slate-900/50 divide-y divide-slate-700/30">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <SkeletonTableRow key={rowIndex} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Skeleton for modal content
 */
export const SkeletonModal: React.FC<{
  title?: boolean;
  content?: boolean;
  table?: boolean;
  className?: string;
}> = ({ title = true, content = true, table = false, className = '' }) => {
  return (
    <div className={`p-6 space-y-6 ${className}`} role="status" aria-label="Loading modal content">
      {title && (
        <div className="space-y-2">
          <Skeleton height="1.5rem" width="60%" className="h-6" />
          <Skeleton height="1rem" width="40%" className="h-4" />
        </div>
      )}
      
      {content && !table && (
        <div className="space-y-4">
          <SkeletonText lines={3} />
          <SkeletonText lines={2} lastLineWidth="60%" />
        </div>
      )}
      
      {table && (
        <SkeletonTable rows={6} columns={4} />
      )}
    </div>
  );
};

/**
 * Skeleton for card content
 */
export const SkeletonCard: React.FC<{
  showImage?: boolean;
  showTitle?: boolean;
  showContent?: boolean;
  className?: string;
}> = ({ showImage = false, showTitle = true, showContent = true, className = '' }) => {
  return (
    <div 
      className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 space-y-4 ${className}`}
      role="status" 
      aria-label="Loading card content"
    >
      {showImage && (
        <Skeleton height="12rem" className="w-full h-48" />
      )}
      
      {showTitle && (
        <Skeleton height="1.5rem" width="70%" className="h-6" />
      )}
      
      {showContent && (
        <SkeletonText lines={3} lastLineWidth="80%" />
      )}
    </div>
  );
};

/**
 * Skeleton for button
 */
export const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <Skeleton 
      className={`${sizeClasses[size]} rounded-lg ${className}`}
      role="status"
      aria-label="Loading button"
    />
  );
};

/**
 * Skeleton for list items
 */
export const SkeletonList: React.FC<{
  items?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ items = 5, showAvatar = false, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list content">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
          {showAvatar && (
            <Skeleton width="2.5rem" height="2.5rem" rounded className="w-10 h-10" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" className="h-4" />
            <Skeleton height="0.875rem" width="40%" className="h-3.5" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Full page skeleton loader
 */
export const SkeletonPage: React.FC<{
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}> = ({ showHeader = true, showSidebar = false, className = '' }) => {
  return (
    <div className={`min-h-screen bg-slate-900 ${className}`} role="status" aria-label="Loading page content">
      {showHeader && (
        <div className="h-16 bg-slate-800/50 border-b border-slate-700/50 flex items-center px-6">
          <Skeleton width="8rem" height="2rem" className="h-8" />
          <div className="ml-auto flex space-x-4">
            <Skeleton width="2rem" height="2rem" rounded className="w-8 h-8" />
            <Skeleton width="2rem" height="2rem" rounded className="w-8 h-8" />
          </div>
        </div>
      )}
      
      <div className="flex">
        {showSidebar && (
          <div className="w-64 bg-slate-800/30 min-h-screen p-4">
            <SkeletonList items={6} />
          </div>
        )}
        
        <div className="flex-1 p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton height="2rem" width="40%" className="h-8" />
            <SkeletonText lines={2} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} showContent />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};