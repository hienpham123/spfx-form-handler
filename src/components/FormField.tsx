import React, { useState, useEffect } from 'react';
import { Spinner } from '@fluentui/react';
import { useFormContext } from '../core/hooks';
import { SharePointFieldMetadata } from '../types';
import { FormTextField } from './FormTextField';
import { FormDropdown } from './FormDropdown';
import { FormDatePicker } from './FormDatePicker';
import { FormCheckbox } from './FormCheckbox';
import { FormMultiChoice } from './FormMultiChoice';
import { FormLookup } from './FormLookup';
import { FormUserPicker } from './FormUserPicker';
import { FormAttachmentPicker } from './FormAttachmentPicker';
import { mockApi } from '../services/mockApi';

export interface FormFieldProps {
  fieldName: string; // SharePoint Internal Field Name
  label?: string; // Optional: override label from metadata
  required?: boolean; // Optional: override required from metadata
  disabled?: boolean;
  placeholder?: string;
  // Custom props to pass to the rendered component
  componentProps?: Record<string, any>;
}

// Cache for field metadata to avoid multiple API calls
const fieldMetadataCache = new Map<string, SharePointFieldMetadata>();

/**
 * FormField component - Automatically renders the correct form component
 * based on SharePoint field type from field metadata
 * 
 * @example
 * ```tsx
 * <FormProvider
 *   config={{
 *     listName: 'Projects',
 *     listUrl: 'https://tenant.sharepoint.com/sites/apps',
 *   }}
 * >
 *   <FormField fieldName="Title" />
 *   <FormField fieldName="Category" />
 *   <FormField fieldName="Status" />
 *   <FormField fieldName="StartDate" />
 *   <FormField fieldName="IsActive" />
 *   <FormField fieldName="AssignedTo" />
 *   <FormField fieldName="Attachments" />
 * </FormProvider>
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  fieldName,
  label,
  required,
  disabled,
  placeholder,
  componentProps = {},
}) => {
  const formContext = useFormContext();
  const [fieldMetadata, setFieldMetadata] = useState<SharePointFieldMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const listName = formContext.listName;
  const listUrl = formContext.listUrl;
  const apiService = formContext.apiService;

  // Cache key
  const cacheKey = `${listName || 'default'}_${listUrl || 'default'}_${fieldName}`;

  // Load field metadata
  useEffect(() => {
    // Check cache first
    if (fieldMetadataCache.has(cacheKey)) {
      setFieldMetadata(fieldMetadataCache.get(cacheKey)!);
      setIsLoading(false);
      return;
    }

    // If no listName, can't load metadata
    if (!listName) {
      setIsLoading(false);
      setLoadError('listName is required in FormProvider config');
      return;
    }

    const loadMetadata = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        let response;

        if (apiService && 'getFieldMetadata' in apiService && typeof apiService.getFieldMetadata === 'function') {
          // Use custom getFieldMetadata method
          response = await (apiService.getFieldMetadata as (listName: string, fieldName: string, listUrl?: string) => Promise<any>)(listName, fieldName, listUrl);
        } else {
          // Fallback to mock API
          response = await mockApi.getFieldMetadata(listName, fieldName, listUrl);
        }

        if (response.success && response.data) {
          const metadata = response.data as SharePointFieldMetadata;
          setFieldMetadata(metadata);
          // Cache the metadata
          fieldMetadataCache.set(cacheKey, metadata);
        } else {
          setLoadError(response.error || 'Failed to load field metadata');
        }
      } catch (error: any) {
        setLoadError(error.message || 'Failed to load field metadata');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, [listName, listUrl, fieldName, cacheKey, apiService]);

  // Determine field name for form (use InternalName or fieldName)
  const formFieldName = fieldMetadata?.InternalName || fieldName;

  // Use metadata or props for label and required
  const fieldLabel = label || fieldMetadata?.Title || fieldName;
  const isRequired = required !== undefined ? required : (fieldMetadata?.Required || false);
  const isDisabled = disabled || fieldMetadata?.ReadOnlyField || false;

  // Render based on field type
  const renderField = () => {
    if (isLoading) {
      return (
        <div style={{ padding: '8px 0' }}>
          <Spinner label={`Loading ${fieldName}...`} />
        </div>
      );
    }

    if (loadError) {
      return (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, padding: '8px 0' }}>
          Error loading field: {loadError}
        </div>
      );
    }

    if (!fieldMetadata) {
      // Fallback to TextField if metadata not available
      return (
        <FormTextField
          name={formFieldName}
          label={fieldLabel}
          required={isRequired}
          disabled={isDisabled}
          placeholder={placeholder}
          {...componentProps}
        />
      );
    }

    const fieldType = fieldMetadata.Type;

    // Map SharePoint field types to form components
    switch (fieldType) {
      case 'Text':
      case 'Note':
      case 'URL':
        return (
          <FormTextField
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder || fieldMetadata.Description}
            multiline={fieldType === 'Note'}
            maxLength={fieldMetadata.MaxLength}
            {...componentProps}
          />
        );

      case 'Number':
      case 'Currency':
        return (
          <FormTextField
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            type="number"
            min={fieldMetadata.Min}
            max={fieldMetadata.Max}
            {...componentProps}
          />
        );

      case 'DateTime':
        return (
          <FormDatePicker
            name={formFieldName}
            label={fieldLabel}
            isRequired={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            {...componentProps}
          />
        );

      case 'Choice':
        return (
          <FormDropdown
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            options={
              fieldMetadata.Choices?.map((choice) => ({
                key: choice,
                text: choice,
              })) || []
            }
            {...componentProps}
          />
        );

      case 'MultiChoice':
        return (
          <FormMultiChoice
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            options={
              fieldMetadata.Choices?.map((choice) => ({
                key: choice,
                text: choice,
              })) || []
            }
            {...componentProps}
          />
        );

      case 'Boolean':
        return (
          <FormCheckbox
            name={formFieldName}
            label={fieldLabel}
            disabled={isDisabled}
            {...componentProps}
          />
        );

      case 'Lookup':
        return (
          <FormLookup
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            lookupList={fieldMetadata.LookupListName || 'Categories'}
            lookupField={fieldMetadata.LookupFieldName || 'Title'}
            {...componentProps}
          />
        );

      case 'LookupMulti':
        return (
          <FormLookup
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            multiSelect
            lookupList={fieldMetadata.LookupListName || 'Categories'}
            lookupField={fieldMetadata.LookupFieldName || 'Title'}
            {...componentProps}
          />
        );

      case 'User':
        return (
          <FormUserPicker
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            {...componentProps}
          />
        );

      case 'UserMulti':
        return (
          <FormUserPicker
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            multiSelect
            {...componentProps}
          />
        );

      case 'Attachment':
        return (
          <FormAttachmentPicker
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            {...componentProps}
          />
        );

      default:
        // Fallback to TextField for unknown types
        return (
          <FormTextField
            name={formFieldName}
            label={fieldLabel}
            required={isRequired}
            disabled={isDisabled}
            placeholder={placeholder}
            {...componentProps}
          />
        );
    }
  };

  return <>{renderField()}</>;
};

