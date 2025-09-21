/**
 * Responsive Grid Container System
 * Flexible grid components that adapt to different screen sizes
 */

import React from 'react';
import { gridSystem, responsiveSpacing } from '../../styles/responsive-utils';

interface GridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

interface GridItemProps {
  children: React.ReactNode;
  span?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  className?: string;
}

/**
 * Main Grid Container Component
 * Provides responsive grid layout with proper gutters and spacing
 */
export const Grid: React.FC<GridProps> = ({
  children,
  columns = { mobile: 4, tablet: 8, desktop: 12 },
  gap = 'base',
  className = '',
}) => {
  const gridClasses = [
    'ds-grid',
    `ds-gap-${gap}`,
    `ds-grid-cols-${columns.mobile || 4}`,
    columns.tablet && `ds-grid-md-cols-${columns.tablet}`,
    columns.desktop && `ds-grid-lg-cols-${columns.desktop}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

/**
 * Grid Item Component
 * Individual grid items with responsive column spanning
 */
export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = { mobile: 1, tablet: 1, desktop: 1 },
  className = '',
}) => {
  const itemClasses = [
    span.mobile && `col-span-${span.mobile}`,
    span.tablet && `md:col-span-${span.tablet}`,
    span.desktop && `lg:col-span-${span.desktop}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClasses}>
      {children}
    </div>
  );
};

/**
 * Responsive Grid Container with Auto Layout
 * Automatically adjusts columns based on content and screen size
 */
interface AutoGridProps {
  children: React.ReactNode;
  minItemWidth?: string;
  gap?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const AutoGrid: React.FC<AutoGridProps> = ({
  children,
  minItemWidth = '250px',
  gap = 'base',
  className = '',
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
    gap: `var(--spacing-${gap})`,
  };

  return (
    <div className={className} style={gridStyle}>
      {children}
    </div>
  );
};

/**
 * Flexbox Grid Alternative
 * Uses flexbox for simpler layouts with automatic wrapping
 */
interface FlexGridProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const FlexGrid: React.FC<FlexGridProps> = ({
  children,
  direction = 'row',
  wrap = true,
  justify = 'start',
  align = 'stretch',
  gap = 'base',
  className = '',
}) => {
  const flexClasses = [
    'flex',
    `flex-${direction}`,
    wrap && 'flex-wrap',
    `justify-${justify}`,
    `items-${align}`,
    `ds-gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
};

export default Grid;