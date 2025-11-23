import React from 'react';
import { Checkbox, Stack } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormMultiChoiceOption {
  key: string;
  text: string;
}

export interface FormMultiChoiceProps {
  name: string;
  label?: string;
  options: FormMultiChoiceOption[];
  required?: boolean;
  disabled?: boolean;
}

/**
 * FormMultiChoice component that integrates with FormProvider
 * Allows multiple selections
 * Supports custom rendering via onRenderField in FormProvider config
 * 
 * @example
 * ```tsx
 * <FormMultiChoice
 *   name="skills"
 *   label="Skills"
 *   options={[
 *     { key: 'react', text: 'React' },
 *     { key: 'typescript', text: 'TypeScript' }
 *   ]}
 * />
 * ```
 */
export const FormMultiChoice: React.FC<FormMultiChoiceProps> = ({
  name,
  label,
  options,
  required,
  disabled,
}) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext();
  const selectedValues = Array.isArray(value) ? value : [];

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  const handleChange = (optionKey: string, checked: boolean) => {
    let newValue: string[];
    if (checked) {
      newValue = [...selectedValues, optionKey];
    } else {
      newValue = selectedValues.filter((v) => v !== optionKey);
    }
    onChange(newValue);
  };

  return (
    <div>
      {label && (
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </div>
      )}
      <Stack tokens={{ childrenGap: 8 }} onBlur={onBlur}>
        {options.map((option) => (
          <Checkbox
            key={option.key}
            label={option.text}
            checked={selectedValues.includes(option.key)}
            onChange={(_e, checked) => handleChange(option.key, checked || false)}
            disabled={disabled}
          />
        ))}
      </Stack>
      {touched && error && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          {error.message}
        </div>
      )}
    </div>
  );
};

