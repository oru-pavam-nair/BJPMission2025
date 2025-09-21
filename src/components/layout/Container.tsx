/**
 * Layout Wrapper Components
 * Main container and section wrapper components with responsive padding and max-width
 */

import React from 'react';
import { containerSizes, responsiveSpacing } from '../../styles/responsive-utils';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
  [key: string]: any; // Allow additional props like data-testid
}

interface SectionProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  background?: 'transparent' | 'primary' | 'secondary' | 'tertiary' | 'card';
  className?: string;
  [key: string]: any; // Allow additional props like data-testid
}

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Main Container Component
 * Provides responsive padding and max-width constraints
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  size = '2xl',
  padding = 'base',
  className = '',
  ...props
}) => {
  const containerClasses = [
    'ds-container',
    size !== 'full' && `max-w-${size}`,
    padding !== 'none' && `ds-p-${padding}`,
    'mx-auto',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const maxWidth = size === 'full' ? '100%' : containerSizes[size] || containerSizes['2xl'];

  const containerStyle = {
    maxWidth: size === 'full' ? '100%' : maxWidth,
    margin: '0 auto',
    paddingLeft: padding !== 'none' ? `var(--spacing-${padding})` : undefined,
    paddingRight: padding !== 'none' ? `var(--spacing-${padding})` : undefined,
  };

  return (
    <div className={containerClasses} style={containerStyle} {...props}>
      {children}
    </div>
  );
};

/**
 * Section Wrapper Component
 * Provides consistent vertical spacing and background options
 */
export const Section: React.FC<SectionProps> = ({
  children,
  spacing = 'xl',
  background = 'transparent',
  className = '',
  ...props
}) => {
  const sectionClasses = [
    'ds-section',
    spacing && `ds-py-${spacing}`,
    background !== 'transparent' && `ds-bg-${background}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses} {...props}>
      {children}
    </section>
  );
};

/**
 * Page Wrapper Component
 * Main page layout wrapper with consistent structure
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  className = '',
}) => {
  return (
    <div className={`min-h-screen ds-bg-primary ${className}`}>
      {title && (
        <Section spacing="lg" background="secondary">
          <Container>
            <h1 className="ds-text-heading-1">{title}</h1>
          </Container>
        </Section>
      )}
      <main>
        {children}
      </main>
    </div>
  );
};

/**
 * Content Area Component
 * Wrapper for main content areas with proper spacing
 */
interface ContentAreaProps {
  children: React.ReactNode;
  padding?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  background?: 'transparent' | 'primary' | 'secondary' | 'tertiary' | 'card';
  rounded?: boolean;
  shadow?: boolean;
  className?: string;
  [key: string]: any; // Allow additional props like data-testid
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  children,
  padding = 'lg',
  background = 'card',
  rounded = true,
  shadow = true,
  className = '',
  ...props
}) => {
  const contentClasses = [
    padding && `ds-p-${padding}`,
    background !== 'transparent' && `ds-bg-${background}`,
    rounded && 'ds-rounded-md',
    shadow && 'ds-shadow-md',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={contentClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Sidebar Layout Component
 * Two-column layout with sidebar and main content
 */
interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  sidebarPosition?: 'left' | 'right';
  gap?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebar,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  gap = 'lg',
  className = '',
}) => {
  const sidebarWidths = {
    sm: '240px',
    md: '320px',
    lg: '384px',
    xl: '448px',
  };

  const layoutStyle = {
    display: 'grid',
    gridTemplateColumns: sidebarPosition === 'left' 
      ? `${sidebarWidths[sidebarWidth]} 1fr`
      : `1fr ${sidebarWidths[sidebarWidth]}`,
    gap: `var(--spacing-${gap})`,
  };

  const mobileLayoutClasses = [
    'grid',
    'grid-cols-1',
    'lg:grid-cols-none',
    `ds-gap-${gap}`,
    className,
  ].join(' ');

  return (
    <div className={mobileLayoutClasses} style={{ ...layoutStyle }}>
      {sidebarPosition === 'left' ? (
        <>
          <aside className="lg:order-1">
            {sidebar}
          </aside>
          <main className="lg:order-2">
            {children}
          </main>
        </>
      ) : (
        <>
          <main className="lg:order-1">
            {children}
          </main>
          <aside className="lg:order-2">
            {sidebar}
          </aside>
        </>
      )}
    </div>
  );
};

/**
 * Stack Layout Component
 * Vertical stack layout with consistent spacing
 */
interface StackProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  [key: string]: any; // Allow additional props like data-testid
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'base',
  align = 'stretch',
  className = '',
  ...props
}) => {
  const stackClasses = [
    'flex',
    'flex-col',
    `ds-gap-${spacing}`,
    align !== 'stretch' && `items-${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
};

export default Container;