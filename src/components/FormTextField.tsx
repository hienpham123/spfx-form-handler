import React from 'react';
import { TextField, ITextFieldProps } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormTextFieldProps extends Omit<ITextFieldProps, 'value' | 'onChange' | 'onBlur' | 'errorMessage'> {
  name: string;
}

/**
 * FormTextField component that integrates with FormProvider
 * Supports custom rendering via onRenderField in FormProvider config
 * 
 * @example
 * ```tsx
 * <FormTextField
 *   name="email"
 *   label="Email"
 *   type="email"
 *   required
 * />
 * ```
 */
export const FormTextField: React.FC<FormTextFieldProps> = ({ name, ...props }) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext();

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Default render
  const handleChange = (_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    onChange(newValue || '');
  };

  return (
    <TextField
      {...props}
      value={value || ''}
      onChange={handleChange}
      onBlur={onBlur}
      errorMessage={touched && error ? error.message : undefined}
    />
  );
};

