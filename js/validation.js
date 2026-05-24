/**
 * Client-side input validation helpers
 */

const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  price: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 999999.99;
  },

  quantity: (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num >= 1 && num <= 999;
  },

  phone: (value) => {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,20}$/;
    return phoneRegex.test(value);
  },

  zipCode: (value) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(value);
  },

  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  minLength: (value, min) => {
    if (typeof value !== 'string') return false;
    return value.length >= min;
  },

  maxLength: (value, max) => {
    if (typeof value !== 'string') return false;
    return value.length <= max;
  },

  min: (value, min) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
  },

  max: (value, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num <= max;
  }
};

/**
 * Validate a form field
 * @param {any} value - The value to validate
 * @param {Array} rules - Array of validation rules
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateField(value, rules) {
  for (const rule of rules) {
    if (rule.required && !validators.required(value)) {
      return { valid: false, error: 'This field is required' };
    }

    if (rule.type && validators[rule.type] && !validators[rule.type](value)) {
      return { valid: false, error: rule.message || `Invalid ${rule.type}` };
    }

    if (rule.minLength && !validators.minLength(value, rule.minLength)) {
      return { valid: false, error: `Must be at least ${rule.minLength} characters` };
    }

    if (rule.maxLength && !validators.maxLength(value, rule.maxLength)) {
      return { valid: false, error: `Must be no more than ${rule.maxLength} characters` };
    }

    if (rule.min !== undefined && !validators.min(value, rule.min)) {
      return { valid: false, error: `Must be at least ${rule.min}` };
    }

    if (rule.max !== undefined && !validators.max(value, rule.max)) {
      return { valid: false, error: `Must be no more than ${rule.max}` };
    }

    if (rule.custom && typeof rule.custom === 'function') {
      const result = rule.custom(value);
      if (!result.valid) {
        return { valid: false, error: result.error || 'Validation failed' };
      }
    }
  }

  return { valid: true, error: null };
}

/**
 * Validate an entire form
 * @param {Object} formData - Object with field names as keys and values as values
 * @param {Object} schema - Object with field names as keys and validation rules as values
 * @returns {Object} - { valid: boolean, errors: Object }
 */
function validateForm(formData, schema) {
  const errors = {};
  let valid = true;

  for (const fieldName in schema) {
    const result = validateField(formData[fieldName], schema[fieldName]);
    if (!result.valid) {
      errors[fieldName] = result.error;
      valid = false;
    }
  }

  return { valid, errors };
}

/**
 * Show inline error for a field
 * @param {string} fieldId - The ID of the field
 * @param {string} message - The error message
 */
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  // Remove existing error
  const existingError = field.parentElement.querySelector('.field-error');
  if (existingError) existingError.remove();

  // Add error styling
  field.style.borderColor = '#e8734a';

  // Add error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.style.cssText = 'color: #e8734a; font-size: 0.75rem; margin-top: 4px;';
  errorDiv.textContent = message;
  field.parentElement.appendChild(errorDiv);
}

/**
 * Clear inline error for a field
 * @param {string} fieldId - The ID of the field
 */
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.style.borderColor = '';
  const existingError = field.parentElement.querySelector('.field-error');
  if (existingError) existingError.remove();
}

/**
 * Clear all field errors in a form
 * @param {string} formId - The ID of the form
 */
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.style.borderColor = '';
  });
}

export {
  validators,
  validateField,
  validateForm,
  showFieldError,
  clearFieldError,
  clearFormErrors
};
