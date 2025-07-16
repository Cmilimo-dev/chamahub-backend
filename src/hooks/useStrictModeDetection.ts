
import { useRef, useEffect } from 'react';

export const useStrictModeDetection = () => {
  const renderCountRef = useRef(0);
  const isStrictModeRef = useRef<boolean | null>(null);

  useEffect(() => {
    renderCountRef.current += 1;
    
    // In StrictMode, useEffect runs twice in development
    // We detect this by checking if the effect runs more than once
    if (renderCountRef.current > 1 && isStrictModeRef.current === null) {
      isStrictModeRef.current = true;
    } else if (renderCountRef.current === 1) {
      // Use a small timeout to check if effect runs again
      const timeout = setTimeout(() => {
        if (renderCountRef.current === 1) {
          isStrictModeRef.current = false;
        }
      }, 0);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  return {
    isStrictMode: isStrictModeRef.current,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
};
