// Fluent UI types - these will be available when @fluentui/react is installed
// Using any for now to avoid type errors during development
type ITextFieldProps = any;
type IDropdownProps = any;
type IDatePickerProps = any;

/// <reference types="react" />

import React from 'react';

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'dropdown' | 'date' | 'checkbox' | 'multichoice';

// SharePoint Field Types
export type SharePointFieldType = 
  | 'Text'
  | 'Note'
  | 'Number'
  | 'Currency'
  | 'DateTime'
  | 'Choice'
  | 'MultiChoice'
  | 'Boolean'
  | 'Lookup'
  | 'LookupMulti'
  | 'User'
  | 'UserMulti'
  | 'Attachment'
  | 'URL'
  | 'Calculated';

export interface SharePointFieldMetadata {
  InternalName: string;
  Title: string;
  Type: SharePointFieldType;
  Required: boolean;
  ReadOnlyField: boolean;
  Choices?: string[]; // For Choice/MultiChoice fields
  LookupListId?: string; // For Lookup fields
  LookupListName?: string; // For Lookup fields
  LookupFieldName?: string; // For Lookup fields
  DefaultValue?: any;
  Description?: string;
  MaxLength?: number;
  Min?: number;
  Max?: number;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
}

export interface FieldError {
  message: string;
  type: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  value?: any;
  defaultValue?: any;
  validation?: ValidationRule;
  error?: FieldError | null;
  disabled?: boolean;
  placeholder?: string;
  options?: Array<{ key: string; text: string }>;
  props?: Partial<ITextFieldProps | IDropdownProps | IDatePickerProps>;
}

export interface FormState {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: FieldError | null;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface FormDirtyFields {
  [key: string]: boolean;
}

export interface SharePointListConfig {
  listName: string;
  listUrl?: string; // Optional, defaults to current web
  itemId?: number; // If provided, will load existing item data
  apiService?: {
    getItem: (listName: string, itemId: number, listUrl?: string) => Promise<ApiResponse<any>>;
  }; // Custom API service
  fieldMapping?: Record<string, string>; // Map SharePoint field names to form field names
}

export interface FormConfig {
  initialValues?: FormState;
  validationSchema?: Record<string, ValidationRule>;
  onSubmit?: (values: FormState) => Promise<any> | any; // Optional - if not provided, will auto save to SharePoint
  onError?: (errors: FormErrors) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  enableReinitialize?: boolean;
  // Custom field rendering
  onRenderField?: (props: CustomFieldRenderProps) => React.ReactNode; // Custom render function for any field
  // SharePoint list configuration - direct props
  id?: number; // Item ID (0 or undefined = new item, > 0 = edit existing)
  listName?: string; // SharePoint list name
  listUrl?: string; // SharePoint list URL (optional) - can be list URL or web URL
  userServiceUrl?: string; // SharePoint web URL for user search (optional, defaults to extracted web URL from listUrl)
  fieldMapping?: Record<string, string>; // Map SharePoint field names to form field names (bidirectional)
  fields?: string[]; // List of field names to automatically select and expand (lookup fields will be auto-expanded)
  autoSave?: boolean; // Auto save to SharePoint on submit (default: true if listName is provided)
  apiService?: {
    getItem: (listName: string, itemId: number, listUrl?: string, fieldNames?: string[]) => Promise<ApiResponse<any>>;
    addItem: (listName: string, data: any, listUrl?: string) => Promise<ApiResponse<any>>;
    updateItem: (listName: string, itemId: number, data: any, listUrl?: string) => Promise<ApiResponse<any>>;
    getListItems?: (listName: string, listUrl?: string) => Promise<ApiResponse<any>>; // Optional: for loading lookup options
    uploadFile?: (listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => Promise<ApiResponse<any>>; // Optional: for uploading attachments
    deleteFile?: (listName: string, itemId: number, fileName: string, listUrl?: string) => Promise<ApiResponse<any>>; // Optional: for deleting attachments
    getFieldMetadata?: (listName: string, fieldName: string, listUrl?: string) => Promise<ApiResponse<SharePointFieldMetadata>>; // Optional: for getting field metadata
    getListFields?: (listName: string, listUrl?: string) => Promise<ApiResponse<SharePointFieldMetadata[]>>; // Optional: for getting all list fields
    searchUsers?: (searchText: string, listUrl?: string) => Promise<ApiResponse<any[]>>; // Optional: for searching users in SharePoint
  }; // Custom API service, defaults to mockApi
  // Legacy listConfig (deprecated, use id/listName/listUrl directly)
  listConfig?: SharePointListConfig;
  onItemLoaded?: (itemData: any) => void; // Callback when item data is loaded
  onLoadError?: (error: string) => void; // Callback when loading fails
  onSaveSuccess?: (data: any) => void; // Callback when save is successful
  onSaveError?: (error: string) => void; // Callback when save fails
  onBeforeSave?: (values: FormState) => FormState | Promise<FormState>; // Transform data before saving
  onValidSave?: (form: UseFormReturn) => boolean; // Custom validation check before saving (default: form.isValid)
}

export interface CustomFieldRenderProps {
  name: string;
  value: any;
  error: FieldError | null;
  touched: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
  setValue: (name: string, value: any) => void;
  getValue: (name: string) => any;
  form: UseFormReturn; // Access to full form context
}

export interface UseFormReturn {
  values: FormState;
  errors: FormErrors;
  touched: FormTouched;
  dirtyFields: FormDirtyFields;
  isSubmitting: boolean;
  isLoading: boolean; // Loading state when fetching item data
  isValid: boolean;
  itemData?: any; // Original item data from SharePoint
  itemId?: number; // Current item ID (0 or undefined means new item)
  listName?: string; // SharePoint list name
  listUrl?: string; // SharePoint list URL
  userServiceUrl?: string; // SharePoint web URL for user search
  setValue: (name: string, value: any) => void;
  getValue: (name: string) => any; // Get value by field name
  setError: (name: string, error: FieldError | null) => void;
  setTouched: (name: string, touched: boolean) => void;
  setValues: (values: FormState) => void;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  resetField: (name: string) => void;
  validate: () => boolean;
  validateField: (name: string) => FieldError | null;
  reloadItemData: () => Promise<void>; // Reload item data from SharePoint
  registerField?: (fieldName: string) => void; // Register field name for auto field collection
}

export interface UseFieldReturn {
  value: any;
  error: FieldError | null;
  touched: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
