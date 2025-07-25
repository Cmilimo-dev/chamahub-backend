
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

const ResponsiveContainer = ({ children, className = '' }: ResponsiveContainerProps) => {
  return (
    <div className={`
      container mx-auto px-4 sm:px-6 lg:px-8 
      max-w-7xl
      ${className}
    `}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
