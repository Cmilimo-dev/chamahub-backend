
import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  className?: string;
}

const ResponsiveGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4 sm:gap-6',
  className = ''
}: ResponsiveGridProps) => {
  const gridCols = `
    grid-cols-${columns.sm || 1}
    ${columns.md ? `md:grid-cols-${columns.md}` : ''}
    ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''}
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}
  `;

  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
