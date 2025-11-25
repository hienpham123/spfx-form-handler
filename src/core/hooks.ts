import { useCallback } from 'react';
import { useFormContext } from './FormProvider';
import { UseFormReturn, UseFieldReturn } from '../types';

// Re-export useFormContext for convenience
export { useFormContext };

/**
 * Hook to access form state and methods
 * Must be used within a FormProvider
 */
export const useForm = (): UseFormReturn => {
  const context = useFormContext();
  return {
    values: context.values,
    errors: context.errors,
    touched: context.touched,
    dirtyFields: context.dirtyFields,
    isSubmitting: context.isSubmitting,
    isLoading: context.isLoading,
    isValid: context.isValid,
    itemData: context.itemData,
    itemId: context.itemId,
    listName: context.listName,
    listUrl: context.listUrl,
    setValue: context.setValue,
    getValue: context.getValue,
    setError: context.setError,
    setTouched: context.setTouched,
    setValues: context.setValues,
    handleChange: context.handleChange,
    handleBlur: context.handleBlur,
    handleSubmit: context.handleSubmit,
    reset: context.reset,
    resetField: context.resetField,
    validate: context.validate,
    validateField: context.validateField,
    reloadItemData: context.reloadItemData,
  };
};

/**
 * Hook to access a specific form field
 * Must be used within a FormProvider
 */
export const useField = (name: string): UseFieldReturn => {
  const { values, errors, touched, handleChange, handleBlur } = useFormContext();

  const onChange = useCallback(
    (value: any) => {
      handleChange(name, value);
    },
    [name, handleChange]
  );

  const onBlur = useCallback(() => {
    handleBlur(name);
  }, [name, handleBlur]);

  return {
    value: values[name],
    error: errors[name] || null,
    touched: touched[name] || false,
    onChange,
    onBlur,
  };
};

