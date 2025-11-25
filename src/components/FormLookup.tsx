import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ReactSelectify, Option } from 'react-selectify';
import { Label, Spinner } from '@fluentui/react';
import { useField } from '../core/hooks';
import { useFormContext } from '../core/FormProvider';


export interface FormLookupProps {
  name: string;
  label?: string;
  multiSelect?: boolean;
  lookupList: string; // List name to load lookup options from
  lookupListUrl?: string; // Optional: URL of the lookup list (defaults to form's listUrl)
  lookupField?: string; // Field name to display (default: 'Title')
  lookupValueField?: string; // Field name for value (default: 'Id')
  options?: Array<{ key: string; text: string }>; // Optional: provide custom options (overrides lookupList)
  onLoadOptions?: (listName: string, listUrl?: string) => Promise<Array<{ key: string; text: string }>>; // Custom loader function
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  styles?: { [key: string]: React.CSSProperties };
  positionOffset?: 'bottom' | 'top';
}

/**
 * FormLookup component for SharePoint Lookup fields
 * Automatically loads options from the specified SharePoint list
 * Supports both single and multi-select lookup
 * 
  */

export const FormLookup: React.FC<FormLookupProps> = ({
  name,
  label,
  multiSelect = false,
  lookupList,
  lookupListUrl,
  lookupField = 'Title',
  lookupValueField = 'Id',
  options: customOptions,
  positionOffset = 'bottom',
  onLoadOptions,
  required,
  disabled,
  placeholder,
  className,
  styles,
}) => {
  const { value, error, touched, onChange } = useField(name);
  const formContext = useFormContext();
  const [options, setOptions] = useState<Array<{ key: string; text: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Determine the URL to use for lookup list
  const targetListUrl = lookupListUrl || formContext.listUrl;

  // Load options from SharePoint list
  useEffect(() => {
    // If custom options provided, use them
    if (customOptions) {
      setOptions(customOptions);
      return;
    }

    // If custom loader provided, use it
    if (onLoadOptions) {
      setIsLoadingOptions(true);
      onLoadOptions(lookupList, targetListUrl)
        .then((loadedOptions) => {
          setOptions(loadedOptions);
          setLoadError(null);
          setIsLoadingOptions(false);
        })
        .catch((err) => {
          setLoadError(err.message || 'Failed to load options');
          setOptions([]);
          setIsLoadingOptions(false);
        });
      return;
    }

    const loadOptions = async () => {
      if (!lookupList) {
        setOptions([]);
        return;
      }

      setIsLoadingOptions(true);
      setLoadError(null);

      try {
        const apiService = formContext.apiService;

        if (!apiService || !('getListItems' in apiService) || !apiService.getListItems) {
          throw new Error('getListItems method is not available in API service. Please provide a valid API service with listUrl.');
        }

        const response = await apiService.getListItems(lookupList, targetListUrl);

        if (response.success && response.data) {
          // Handle different response formats
          const items = Array.isArray(response.data)
            ? response.data
            : (response.data.value || response.data.results || []);

          const mappedOptions = items.map((item: any) => ({
            key: String(item[lookupValueField] || item.Id || item.id),
            text: item[lookupField] || item.Title || item.title || String(item[lookupValueField] || item.Id),
          }));

          setOptions(mappedOptions);
        } else {
          setLoadError(response.error || 'Failed to load options');
          setOptions([]);
        }
      } catch (error: any) {
        setLoadError(error.message || 'Failed to load lookup options');
        setOptions([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [lookupList, targetListUrl, customOptions, onLoadOptions, lookupField, lookupValueField, formContext.config]);

  // Convert options to react-selectify format
  const reactSelectifyOptions: Option[] = useMemo(() => {
    return options.map(opt => ({
      key: opt.key,
      text: opt.text,
    }));
  }, [options]);

  // Get selected keys for react-selectify
  const selectedKeys = useMemo<string[]>(() => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      return currentValues.map((v: any) => {
        const vId = typeof v === 'object' && v.Id !== undefined ? String(v.Id) : String(v);
        return vId;
      });
    } else {
      if (!value) return [];
      const vId = typeof value === 'object' && value.Id !== undefined ? String(value.Id) : String(value);
      return [vId];
    }
  }, [value, multiSelect]);

  // Create a key to force re-render when value changes (to clear filter in ReactSelectify)
  // Only use key for single-select to clear filter, not for multi-select to keep dropdown open
  const selectifyKey = useMemo(() => {
    if (multiSelect) {
      // Don't use key for multi-select to keep dropdown open
      return undefined;
    } else {
      // Use key for single-select to clear filter after selection
      if (!value) return '';
      const vId = typeof value === 'object' && value.Id !== undefined ? String(value.Id) : String(value);
      return vId;
    }
  }, [value, multiSelect]);

  // Handle change from react-selectify
  // Wrap in useCallback and use setTimeout to avoid setState during render
  const handleChange = useCallback((_event?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: Option) => {
    // Use setTimeout to defer state update until after render
    setTimeout(() => {
      if (!option) {
        if (!multiSelect) {
          onChange(null);
        }
        return;
      }

      if (multiSelect) {
        // Multi-select: toggle selection
        const currentValues = Array.isArray(value) ? value : [];
        const optionId = option.key;
        const isSelected = currentValues.some((v: any) => {
          const vId = typeof v === 'object' && v.Id !== undefined ? String(v.Id) : String(v);
          return vId === optionId;
        });

        if (isSelected) {
          onChange(currentValues.filter((v: any) => {
            const vId = typeof v === 'object' && v.Id !== undefined ? String(v.Id) : String(v);
            return vId !== optionId;
          }));
        } else {
          // Find option object from options to keep the object structure
          const selectedOption = options.find(opt => String(opt.key) === optionId);
          if (selectedOption) {
            onChange([...currentValues, { Id: option.key, [lookupField]: option.text }]);
          } else {
            onChange([...currentValues, option.key]);
          }
        }
      } else {
        // Single select: save object with Id and Title
        const selectedOption = options.find(opt => String(opt.key) === String(option.key));
        if (selectedOption) {
          onChange({ Id: option.key, [lookupField]: option.text });
        } else {
          onChange(option.key);
        }
      }
    }, 0);
  }, [multiSelect, value, options, lookupField, onChange]);

  const errorMessage = touched && error ? error.message : undefined;

  // Show loading state
  if (isLoadingOptions && options.length === 0) {
    return (
      <div>
        {label && (
          <Label required={required} disabled={disabled}>
            {label}
          </Label>
        )}
        <Spinner label="Loading options..." />
      </div>
    );
  }

  return (
    <div>
      {label && (
        <Label required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      <ReactSelectify
        showTooltip
        positionOffset={positionOffset}
        {...(selectifyKey !== undefined ? { key: selectifyKey } : {})}
        options={reactSelectifyOptions}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        multiple={multiSelect}
        disabled={disabled || isLoadingOptions}
        placeholder={
          placeholder ||
          (isLoadingOptions
            ? 'Loading options...'
            : `Select ${lookupList || 'option'}${multiSelect ? 's' : ''}`)
        }
        className={`${className || ''} ${errorMessage ? 'form-field-error' : ''}`.trim()}
        styles={{
          root: {
            width: '100%',
            ...(styles?.root || {}),
          },
          input: styles?.input || {},
          callOut: {
            maxHeight: '300px',
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
      {loadError && !touched && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          Failed to load options: {loadError}
        </div>
      )}
    </div>
  );
};
