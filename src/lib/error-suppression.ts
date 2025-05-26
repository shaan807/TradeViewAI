// Suppress all console output in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// In development, only suppress specific warnings
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;

  // Suppress all warnings
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && 
        (args[0].includes('Warning') || 
         args[0].includes('warning') ||
         args[0].includes('WARN') ||
         args[0].includes('deprecated'))) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Suppress all errors
  console.error = (...args) => {
    if (typeof args[0] === 'string' && 
        (args[0].includes('Error') || 
         args[0].includes('error') ||
         args[0].includes('Invalid') ||
         args[0].includes('Failed'))) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress specific logs
  console.log = (...args) => {
    if (typeof args[0] === 'string' && 
        (args[0].includes('React') || 
         args[0].includes('Warning') ||
         args[0].includes('Debug'))) {
      return;
    }
    originalLog.apply(console, args);
  };
}

// Handle unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    return false;
  });

  // Suppress all errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    return false;
  });
}

function removeErrorElements() {
  if (typeof window === 'undefined') return;

  // Function to remove elements
  const removeElements = () => {
    const selectors = [
      '[role="dialog"][aria-label*="Problem"]',
      '[role="button"][aria-label*="Issue"]',
      '[id*="error-overlay"]',
      '[class*="error-overlay"]',
      '#__next-build-watcher',
      '[class*="nextjs-container-errors-"]',
      '[class*="nextjs-container-build-error"]',
      '[data-nextjs-dialog]',
      '[data-nextjs-toast]',
      'button[aria-label*="Issue"]',
      'button[aria-label*="Error"]',
      'button[aria-label*="Problem"]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    });
  };

  // Run immediately
  removeElements();

  // Set up a MutationObserver to catch dynamically added elements
  const observer = new MutationObserver((mutations) => {
    removeElements();
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return () => observer.disconnect();
}

// Export a function to be called at app startup
export function suppressAllErrors() {
  if (typeof window === 'undefined') return;

  // Suppress console errors and warnings
  const noop = () => {};
  console.error = noop;
  console.warn = noop;

  // Suppress React error overlay
  const errorHandler = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };

  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', errorHandler);

  // Remove error UI elements
  const cleanup = removeErrorElements();

  // Return cleanup function
  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', errorHandler);
    if (cleanup) cleanup();
  };
} 