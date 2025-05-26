// Disable console warnings from Recharts
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('recharts') || 
       args[0].includes('validateDOMNesting') ||
       args[0].includes('Warning:'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export function suppressChartWarnings() {
  // Suppress React development warnings
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning:') ||
         args[0].includes('React does not recognize') ||
         args[0].includes('Invalid prop'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }
} 