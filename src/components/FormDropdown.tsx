import React, { useMemo, useCallback } from 'react';
import { ReactSelectify, Option } from 'react-selectify';
import { Label } from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface FormDropdownProps {
  name: string;
  label?: string;
  options?: Array<{ key: string; text: string }>; // Options for the dropdown
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  styles?: { [key: string]: React.CSSProperties };
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
export const FormDropdown: React.FC<FormDropdownProps> = ({ name, label, options = [], required, disabled, placeholder, className, styles }) => {
  const { value, error, touched, onChange } = useField(name);
  const formContext = useFormContext();

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Convert options to react-selectify format
  const reactSelectifyOptions: Option[] = useMemo(() => {
    return options.map(opt => ({
      key: opt.key,
      text: opt.text,
    }));
  }, [options]);

  // Get selected keys for react-selectify
  const selectedKeys = useMemo<string[]>(() => {
    if (!value) return [];
    return [String(value)];
  }, [value]);

  // Create a key to force re-render when value changes (to clear filter in ReactSelectify)
  const selectifyKey = useMemo(() => {
    if (!value) return '';
    return String(value);
  }, [value]);

  // Handle change from react-selectify
  const handleChange = useCallback((_event?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: Option) => {
    // Use setTimeout to defer state update until after render
    setTimeout(() => {
      if (!option) {
        onChange(null);
        return;
      }
      onChange(option.key);
    }, 0);
  }, [onChange]);

  const errorMessage = touched && error ? error.message : undefined;

  return (
    <div>
      {label && (
        <Label required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      <ReactSelectify
        key={selectifyKey}
        options={reactSelectifyOptions}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        multiple={false}
        disabled={disabled}
        placeholder={placeholder}
        className={`${className || ''} ${errorMessage ? 'form-field-error' : ''}`.trim()}
        styles={{
          root: {
            width: '100%',
            ...(styles?.root || {}),
          },
          input: styles?.input || {},
          callOut: {
            maxHeight: '500px',
            overflowY: 'auto',
            ...(styles?.callOut || {}),
          },
          ...(styles || {}),
        }}
      />
      {errorMessage && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};
