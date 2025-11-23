import React from 'react';
import { DatePicker, IDatePickerProps } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormDatePickerProps extends Omit<IDatePickerProps, 'value' | 'onSelectDate' | 'onBlur'> {
  name: string;
}

/**
 * FormDatePicker component that integrates with FormProvider
 * 
 * @example
 * ```tsx
 * <FormDatePicker
 *   name="startDate"
 *   label="Start Date"
 *   required
 * />
 * ```
 */
export const FormDatePicker: React.FC<FormDatePickerProps> = ({ name, ...props }) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext();

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Default render
  const handleSelectDate = (date: Date | null | undefined) => {
    onChange(date || null);
  };

  return (
    <DatePicker
      {...props}
      value={value || undefined}
      onSelectDate={handleSelectDate}
      onBlur={onBlur}
      // Note: DatePicker doesn't have errorMessage prop, so we'll use placeholder
      placeholder={touched && error ? error.message : props.placeholder}
    />
  );
};

