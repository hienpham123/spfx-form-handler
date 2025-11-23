import React from 'react';
import { Checkbox, ICheckboxProps } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormCheckboxProps extends Omit<ICheckboxProps, 'checked' | 'onChange' | 'onBlur'> {
  name: string;
}

/**
 * FormCheckbox component that integrates with FormProvider
 * 
 * @example
 * ```tsx
 * <FormCheckbox
 *   name="agreeToTerms"
 *   label="I agree to the terms and conditions"
 * />
 * ```
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({ name, ...props }) => {
  const { value, onChange, onBlur } = useField(name);
  const formContext = useFormContext();

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Default render
  const handleChange = (_e?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    onChange(checked || false);
  };

  return (
    <Checkbox
      {...props}
      checked={value || false}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
};

