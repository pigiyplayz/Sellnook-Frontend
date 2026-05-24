/**
 * Async operation helpers with loading states and error handling
 */

/**
 * Execute an async operation with loading state management
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Promise} - The result of the async function
 */
async function withLoading(asyncFn, options = {}) {
  const {
    loadingElement = null,
    loadingText = 'Loading...',
    disableElements = [],
    showLoader = true,
    onError = null,
    onSuccess = null
  } = options;

  // Show loading state
  if (showLoader && window.hideLoader) {
    // Temporarily show the loader
    const loader = document.getElementById('site-loader');
    if (loader) {
      loader.classList.remove('hide');
      loader.style.visibility = 'visible';
      loader.style.opacity = '1';
    }
  }

  // Disable specified elements
  const disabledElements = [];
  disableElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.disabled = true;
      el.dataset.wasDisabled = 'true';
      disabledElements.push(el);
    });
  });

  // Set loading text if element provided
  if (loadingElement) {
    const el = typeof loadingElement === 'string' 
      ? document.querySelector(loadingElement) 
      : loadingElement;
    if (el) {
      el.dataset.originalText = el.textContent;
      el.textContent = loadingText;
      el.disabled = true;
    }
  }

  try {
    const result = await asyncFn();
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error) {
    console.error('Async operation failed:', error);
    
    if (onError) {
      onError(error);
    } else {
      // Default error handling
      showToast(error.message || 'An error occurred', 'error');
    }
    
    throw error;
  } finally {
    // Hide loading state
    if (showLoader && window.hideLoader) {
      window.hideLoader();
    }

    // Re-enable elements
    disabledElements.forEach(el => {
      el.disabled = false;
      delete el.dataset.wasDisabled;
    });

    // Restore element text
    if (loadingElement) {
      const el = typeof loadingElement === 'string' 
        ? document.querySelector(loadingElement) 
        : loadingElement;
      if (el) {
        el.textContent = el.dataset.originalText || el.textContent;
        el.disabled = false;
      }
    }
  }
}

/**
 * Retry an async operation with exponential backoff
 * @param {Function} asyncFn - The async function to retry
 * @param {Object} options - Retry configuration
 * @returns {Promise} - The result of the async function
 */
async function withRetry(asyncFn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      
      if (onRetry) {
        onRetry(attempt, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success', 'error', 'info', 'warning')
 * @param {number} duration - How long to show the toast (ms)
 */
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  const colors = {
    success: '#2d9e6b',
    error: '#e8734a',
    info: '#1a1a1a',
    warning: '#f59e0b'
  };

  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-size: 0.875rem;
    font-weight: 500;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  // Add animation keyframes if not exists
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in ms
 * @returns {Function} - The debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 * @param {Function} func - The function to throttle
 * @param {number} limit - The throttle limit in ms
 * @returns {Function} - The throttled function
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export {
  withLoading,
  withRetry,
  showToast,
  debounce,
  throttle
};
