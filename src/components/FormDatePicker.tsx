import React from 'react';
import { DatePicker, IDatePickerProps } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormDatePickerProps extends Omit<IDatePickerProps, 'value' | 'onSelectDate' | 'onBlur'> {
  name: string;
  isRequired?: boolean;
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

  const getDateValue = (): Date | undefined => {
    if (!value) return undefined;

    // If already a Date object, return it
    if (value instanceof Date) {
      return value;
    }

    // If it's a string, convert to Date
    if (typeof value === 'string') {
      const date = new Date(value);
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return undefined;
  };

  // Default render
  const handleSelectDate = (date: Date | null | undefined) => {
    onChange(date || null);
  };

  const errorMessage = touched && error ? error.message : undefined;

  return (
    <div>
      <DatePicker
        {...props}
        value={getDateValue()}
        onSelectDate={handleSelectDate}
        onBlur={onBlur}
        placeholder={props.placeholder}
        styles={errorMessage ? {
          ...(props.styles || {}),
          textField: {
            ...((props.styles as any)?.textField || {}),
            fieldGroup: {
              ...((props.styles as any)?.textField?.fieldGroup || {}),
              borderColor: 'rgb(164, 38, 44) !important',
            },
            root: {
              ...((props.styles as any)?.textField?.root || {}),
              selectors: {
                '& .ms-TextField-fieldGroup': {
                  borderColor: 'rgb(164, 38, 44) !important',
                },
                '& .ms-TextField-fieldGroup:focus': {
                  borderColor: 'rgb(164, 38, 44) !important',
                },
              },
            },
          },
        } : (props.styles || {})}
      />
      {errorMessage && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

