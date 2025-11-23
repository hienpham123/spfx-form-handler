import { ValidationRule, FieldError } from '../types';

export const validateField = (value: any, rules?: ValidationRule): FieldError | null => {
  if (!rules) return null;

  // Required validation
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return { message: 'This field is required', type: 'required' };
    }
  }

  // Skip other validations if value is empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Email validation
  if (rules.email || rules.pattern) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (rules.email && typeof value === 'string' && !emailPattern.test(value)) {
      return { message: 'Please enter a valid email address', type: 'email' };
    }
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return { message: 'Please enter a valid value', type: 'pattern' };
    }
  }

  // String length validations
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return {
        message: `Minimum length is ${rules.minLength} characters`,
        type: 'minLength',
      };
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return {
        message: `Maximum length is ${rules.maxLength} characters`,
        type: 'maxLength',
      };
    }
  }

  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = typeof value === 'number' ? value : Number(value);
    if (rules.min !== undefined && numValue < rules.min) {
      return { message: `Minimum value is ${rules.min}`, type: 'min' };
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return { message: `Maximum value is ${numValue}`, type: 'max' };
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return { message: customError, type: 'custom' };
    }
  }

  return null;
};

export const validateForm = (
  values: Record<string, any>,
  validationSchema?: Record<string, ValidationRule>
): Record<string, FieldError | null> => {
  const errors: Record<string, FieldError | null> = {};

  if (!validationSchema) return errors;

  Object.keys(validationSchema).forEach((fieldName) => {
    const rules = validationSchema[fieldName];
    const value = values[fieldName];
    errors[fieldName] = validateField(value, rules);
  });

  return errors;
};

