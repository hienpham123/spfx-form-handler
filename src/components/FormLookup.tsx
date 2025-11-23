import React, { useState, useEffect } from 'react';
import { Dropdown, IDropdownProps, Spinner } from '@fluentui/react';
import { useField } from '../core/hooks';
import { useFormContext } from '../core/FormProvider';
import { mockApi } from '../services/mockApi';

export interface FormLookupProps extends Omit<IDropdownProps, 'selectedKey' | 'selectedKeys' | 'onChange' | 'onBlur' | 'errorMessage' | 'options'> {
  name: string;
  multiSelect?: boolean;
  lookupList: string; // List name to load lookup options from
  lookupListUrl?: string; // Optional: URL of the lookup list (defaults to form's listUrl)
  lookupField?: string; // Field name to display (default: 'Title')
  lookupValueField?: string; // Field name for value (default: 'Id')
  options?: Array<{ key: string; text: string }>; // Optional: provide custom options (overrides lookupList)
  onLoadOptions?: (listName: string, listUrl?: string) => Promise<Array<{ key: string; text: string }>>; // Custom loader function
}

/**
 * FormLookup component for SharePoint Lookup fields
 * Automatically loads options from the specified SharePoint list
 * Supports both single and multi-select lookup
 * 
 * @example
 * ```tsx
 * // Single select lookup - loads from Categories list
 * <FormLookup
 *   name="category"
 *   label="Category"
 *   lookupList="Categories"
 *   required
 * />
 * 
 * // Multi-select lookup - loads from Tags list
 * <FormLookup
 *   name="tags"
 *   label="Tags"
 *   lookupList="Tags"
 *   multiSelect
 * />
 * 
 * // With custom URL
 * <FormLookup
 *   name="category"
 *   label="Category"
 *   lookupList="Categories"
 *   lookupListUrl="https://tenant.sharepoint.com/sites/site"
 * />
 * ```
 */
export const FormLookup: React.FC<FormLookupProps> = ({ 
  name, 
  multiSelect = false,
  lookupList,
  lookupListUrl,
  lookupField = 'Title',
  lookupValueField = 'Id',
  options: customOptions,
  onLoadOptions,
  ...props 
}) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext(); // Get form context to access listUrl and apiService
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

    // Use form's apiService or default to mockApi
    const loadOptions = async () => {
      if (!lookupList) {
        setOptions([]);
        return;
      }

      setIsLoadingOptions(true);
      setLoadError(null);

      try {
        // Get API service from form context
        // FormProvider exposes apiService directly in context
        const apiService = formContext.apiService;
        
        let response;
        
        if (apiService && 'getListItems' in apiService && apiService.getListItems) {
          // Use getListItems method from apiService (real or mock)
          response = await apiService.getListItems(lookupList, targetListUrl);
        } else {
          // Fallback to mock API (shouldn't happen if apiService is properly set up)
          response = await mockApi.getListItems(lookupList, targetListUrl);
        }

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

  const handleChange = (_e: React.FormEvent<HTMLDivElement>, option?: any) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (option) {
        const isSelected = currentValues.includes(option.key);
        if (isSelected) {
          onChange(currentValues.filter((v) => v !== option.key));
        } else {
          onChange([...currentValues, option.key]);
        }
      }
    } else {
      onChange(option?.key || null);
    }
  };

  // Show loading state
  if (isLoadingOptions && options.length === 0) {
    return (
      <div>
        {props.label && (
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            {props.label}
            {props.required && <span style={{ color: 'red' }}> *</span>}
          </div>
        )}
        <Spinner label="Loading options..." />
      </div>
    );
  }

  return (
    <div>
      <Dropdown
        {...props}
        selectedKey={multiSelect ? undefined : (value || undefined)}
        selectedKeys={multiSelect ? (Array.isArray(value) ? value : []) : undefined}
        options={options}
        multiSelect={multiSelect}
        onChange={handleChange}
        onBlur={onBlur}
        errorMessage={
          (touched && error ? error.message : undefined) ||
          (loadError ? `Failed to load options: ${loadError}` : undefined)
        }
        placeholder={
          props.placeholder || 
          (isLoadingOptions 
            ? 'Loading options...' 
            : `Select ${lookupList || 'option'}${multiSelect ? 's' : ''}`)
        }
        disabled={props.disabled || isLoadingOptions}
      />
      {loadError && !touched && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          {loadError}
        </div>
      )}
    </div>
  );
};

