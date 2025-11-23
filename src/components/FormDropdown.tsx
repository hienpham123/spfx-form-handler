import React from 'react';
import { Dropdown, IDropdownProps } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormDropdownProps extends Omit<IDropdownProps, 'selectedKey' | 'onChange' | 'onBlur' | 'errorMessage'> {
  name: string;
}

/**
 * FormDropdown component that integrates with FormProvider
 * Supports custom rendering via onRenderField in FormProvider config
 * 
 * @example
 * ```tsx
 * <FormDropdown
 *   name="status"
 *   label="Status"
 *   options={[
 *     { key: 'active', text: 'Active' },
 *     { key: 'inactive', text: 'Inactive' }
 *   ]}
 *   required
 * />
 * ```
 */
export const FormDropdown: React.FC<FormDropdownProps> = ({ name, ...props }) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext();

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Default render
  const handleChange = (_e: React.FormEvent<HTMLDivElement>, option?: any) => {
    onChange(option?.key || null);
  };

  return (
    <Dropdown
      {...props}
      selectedKey={value}
      onChange={handleChange}
      onBlur={onBlur}
      errorMessage={touched && error ? error.message : undefined}
    />
  );
};

