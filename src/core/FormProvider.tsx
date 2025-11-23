import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { FormConfig, FormState, FormErrors, FormTouched, UseFormReturn, CustomFieldRenderProps } from '../types';
import { validateForm, validateField } from '../utils/validation';
import { mockApi } from '../services/mockApi';

interface FormContextValue extends UseFormReturn {
  config: FormConfig;
  apiService: {
    getItem: (listName: string, itemId: number, listUrl?: string) => Promise<any>;
    addItem: (listName: string, data: any, listUrl?: string) => Promise<any>;
    updateItem: (listName: string, itemId: number, data: any, listUrl?: string) => Promise<any>;
    getListItems?: (listName: string, listUrl?: string) => Promise<any>;
    uploadFile?: (listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => Promise<any>;
    deleteFile?: (listName: string, itemId: number, fileName: string, listUrl?: string) => Promise<any>;
    getFieldMetadata?: (listName: string, fieldName: string, listUrl?: string) => Promise<any>;
    getListFields?: (listName: string, listUrl?: string) => Promise<any>;
  };
  renderCustomField: (name: string) => React.ReactNode | null; // Function to render custom field
}

const FormContext = createContext<FormContextValue | null>(null);

let globalFormContext: FormContextValue | null = null;

export const setGlobalFormContext = (context: FormContextValue | null) => {
  globalFormContext = context;
};

export const getGlobalFormContext = (): FormContextValue | null => {
  return globalFormContext;
};

interface FormProviderProps {
  children: ReactNode;
  config: FormConfig;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, config }) => {
  const [values, setValues] = useState<FormState>(config.initialValues || {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [itemData, setItemData] = useState<any>(null);

  // Get id, listName, listUrl from config (direct props or from listConfig for backward compatibility)
  const itemId = config.id !== undefined ? config.id : config.listConfig?.itemId;
  const listName = config.listName || config.listConfig?.listName;
  const listUrl = config.listUrl || config.listConfig?.listUrl;
  const fieldMapping = config.fieldMapping || config.listConfig?.fieldMapping || {};
  const autoSave = config.autoSave !== false && listName ? true : false; // Default to true if listName is provided
  
  // Ensure apiService has all required methods
  const customApiService = config.apiService || config.listConfig?.apiService;
  const apiService = {
    getItem: (customApiService?.getItem 
      ? customApiService.getItem 
      : async (listName: string, itemId: number, listUrl?: string) => {
          return await mockApi.getListItem(listName, itemId, listUrl);
        }) as (listName: string, itemId: number, listUrl?: string) => Promise<any>,
    addItem: (customApiService && 'addItem' in customApiService && customApiService.addItem
      ? customApiService.addItem
      : async (listName: string, data: any, listUrl?: string) => {
          return await mockApi.addListItem(listName, data, listUrl);
        }) as (listName: string, data: any, listUrl?: string) => Promise<any>,
    updateItem: (customApiService && 'updateItem' in customApiService && customApiService.updateItem
      ? customApiService.updateItem
      : async (listName: string, itemId: number, data: any, listUrl?: string) => {
          return await mockApi.updateListItem(listName, itemId, data, listUrl);
        }) as (listName: string, itemId: number, data: any, listUrl?: string) => Promise<any>,
    getListItems: (customApiService && 'getListItems' in customApiService && customApiService.getListItems
      ? customApiService.getListItems
      : async (listName: string, listUrl?: string) => {
          return await mockApi.getListItems(listName, listUrl);
        }) as (listName: string, listUrl?: string) => Promise<any>,
    uploadFile: (customApiService && 'uploadFile' in customApiService && customApiService.uploadFile
      ? customApiService.uploadFile
      : async (listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => {
          return await mockApi.uploadFile(listName, itemId, file, fileName, listUrl);
        }) as (listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => Promise<any>,
    deleteFile: (customApiService && 'deleteFile' in customApiService && customApiService.deleteFile
      ? customApiService.deleteFile
      : async (listName: string, itemId: number, fileName: string, listUrl?: string) => {
          return await mockApi.deleteFile(listName, itemId, fileName, listUrl);
        }) as (listName: string, itemId: number, fileName: string, listUrl?: string) => Promise<any>,
    getFieldMetadata: (customApiService && 'getFieldMetadata' in customApiService && customApiService.getFieldMetadata
      ? customApiService.getFieldMetadata
      : async (listName: string, fieldName: string, listUrl?: string) => {
          return await mockApi.getFieldMetadata(listName, fieldName, listUrl);
        }) as (listName: string, fieldName: string, listUrl?: string) => Promise<any>,
    getListFields: (customApiService && 'getListFields' in customApiService && customApiService.getListFields
      ? customApiService.getListFields
      : async (listName: string, listUrl?: string) => {
          return await mockApi.getListFields(listName, listUrl);
        }) as (listName: string, listUrl?: string) => Promise<any>,
  };

  // Load item data from SharePoint if id is provided and > 0
  const loadItemData = useCallback(async () => {
    // If id is 0, undefined, or null, it's a new item - don't load
    if (!itemId || itemId === 0 || !listName) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getItem(listName, itemId, listUrl);

      if (response.success && response.data) {
        setItemData(response.data);

        // Map SharePoint field names to form field names
        const mappedData: FormState = {};

        Object.keys(response.data).forEach((spFieldName) => {
          const formFieldName = fieldMapping[spFieldName] || spFieldName;
          let value = response.data[spFieldName];

          // Handle complex types (User, Lookup, etc.)
          if (value && typeof value === 'object') {
            if (value.Id !== undefined) {
              // User or Lookup field
              value = value.Id;
            } else if (Array.isArray(value) && value.length > 0 && value[0].Id !== undefined) {
              // Multi-user or Multi-lookup field
              value = value.map((item: any) => item.Id);
            } else if (value.results) {
              // SharePoint REST API array format
              value = value.results.map((item: any) => (item.Id !== undefined ? item.Id : item));
            }
          }

          mappedData[formFieldName] = value;
        });

        // Merge with initialValues (initialValues take precedence)
        const mergedValues = {
          ...mappedData,
          ...(config.initialValues || {}),
        };

        setValues(mergedValues);

        if (config.onItemLoaded) {
          config.onItemLoaded(response.data);
        }
      } else {
        const errorMsg = response.error || 'Failed to load item data';
        if (config.onLoadError) {
          config.onLoadError(errorMsg);
        } else {
          console.error('Failed to load item data:', errorMsg);
        }
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to load item data';
      if (config.onLoadError) {
        config.onLoadError(errorMsg);
      } else {
        console.error('Error loading item data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemId, listName, listUrl, fieldMapping, apiService, config.initialValues, config.onItemLoaded, config.onLoadError]);

  // Load item data on mount if id is provided and > 0
  useEffect(() => {
    if (itemId && itemId > 0 && listName) {
      loadItemData();
    }
  }, [itemId, listName, listUrl]); // Only reload if id, listName, or listUrl changes

  // Reinitialize form if enableReinitialize is true and initialValues change
  useEffect(() => {
    if (config.enableReinitialize && config.initialValues) {
      setValues(config.initialValues);
      setErrors({});
      setTouched({});
    }
  }, [config.initialValues, config.enableReinitialize]);

  const setValue = useCallback((fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const getValue = useCallback((fieldName: string) => {
    return values[fieldName];
  }, [values]);

  const setError = useCallback((name: string, error: any) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const setAllValues = useCallback((newValues: FormState) => {
    setValues(newValues);
  }, []);

  const handleChange = useCallback(
    (name: string, value: any) => {
      setValue(name, value);

      if (config.validateOnChange) {
        const error = validateField(value, config.validationSchema?.[name]);
        setError(name, error);
      }
    },
    [config.validateOnChange, config.validationSchema, setValue, setError]
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouchedField(name, true);

      if (config.validateOnBlur !== false) {
        const error = validateField(values[name], config.validationSchema?.[name]);
        setError(name, error);
      }
    },
    [config.validateOnBlur, config.validationSchema, values, setTouchedField, setError]
  );

  const validate = useCallback((): boolean => {
    const newErrors = validateForm(values, config.validationSchema);
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === null);
  }, [values, config.validationSchema]);

  const validateFieldByName = useCallback(
    (name: string) => {
      const error = validateField(values[name], config.validationSchema?.[name]);
      setError(name, error);
      return error;
    },
    [values, config.validationSchema, setError]
  );

  const reset = useCallback(() => {
    setValues(config.initialValues || {});
    setErrors({});
    setTouched({});
  }, [config.initialValues]);

  const resetField = useCallback(
    (name: string) => {
      const defaultValue = config.initialValues?.[name];
      setValue(name, defaultValue);
      setError(name, null);
      setTouchedField(name, false);
    },
    [config.initialValues, setValue, setError, setTouchedField]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allFields = Object.keys(config.validationSchema || {});
      const newTouched: FormTouched = {};
      allFields.forEach((field) => {
        newTouched[field] = true;
      });
      setTouched(newTouched);

      // Validate form
      const isValid = validate();
      
      // Check custom validation using onValidSave if provided
      let canSave = isValid;
      if (config.onValidSave) {
        const formContext = {
          values,
          errors,
          touched,
          isSubmitting,
          isLoading,
          isValid,
          itemData,
          itemId: itemId && itemId > 0 ? itemId : undefined,
          listName,
          listUrl,
          setValue,
          getValue,
          setError,
          setTouched: setTouchedField,
          setValues: setAllValues,
          handleChange,
          handleBlur,
          handleSubmit,
          reset,
          resetField,
          validate,
          validateField: validateFieldByName,
          reloadItemData: loadItemData,
        };
        canSave = config.onValidSave(formContext);
      }
      
      if (!canSave) {
        if (config.onError) {
          const currentErrors = validateForm(values, config.validationSchema);
          config.onError(currentErrors);
        }
        return;
      }

      setIsSubmitting(true);
      try {
        // Transform data using onBeforeSave if provided
        let dataToSave = values;
        if (config.onBeforeSave) {
          const transformedData = await config.onBeforeSave(values);
          dataToSave = transformedData;
        }
        
        let result: any;

        // Auto save to SharePoint if autoSave is enabled and listName is provided
        if (autoSave && listName) {
          // Reverse field mapping: form field names -> SharePoint field names
          const reverseMapping: Record<string, string> = {};
          Object.keys(fieldMapping).forEach((spField) => {
            const formField = fieldMapping[spField];
            reverseMapping[formField] = spField;
          });

          // Map form values to SharePoint field names
          // Separate attachments from other data
          const spData: any = {};
          const attachmentFields: Record<string, any[]> = {}; // Store attachments by field name
          
          Object.keys(dataToSave).forEach((formFieldName) => {
            const spFieldName = reverseMapping[formFieldName] || formFieldName;
            const fieldValue = dataToSave[formFieldName];
            
            // Check if this is an attachment field (array of AttachmentInfo)
            if (Array.isArray(fieldValue) && fieldValue.length > 0 && fieldValue[0]?.file) {
              // This is an attachment field with new files to upload
              attachmentFields[formFieldName] = fieldValue;
              // Don't include attachments in spData - we'll upload them separately
            } else {
              spData[spFieldName] = fieldValue;
            }
          });

          let savedItemId: number;

          if (itemId && itemId > 0) {
            // Update existing item
            const response = await apiService.updateItem(listName, itemId, spData, listUrl);
            if (!response.success) {
              throw new Error(response.error || 'Failed to update item');
            }
            result = response.data;
            savedItemId = itemId;
            
            // Update itemData with new data
            setItemData(response.data);
          } else {
            // Add new item
            const response = await apiService.addItem(listName, spData, listUrl);
            if (!response.success) {
              throw new Error(response.error || 'Failed to create item');
            }
            result = response.data;
            savedItemId = result.Id || itemId || 0;
            
            // Set the new item ID
            if (result.Id) {
              setItemData(result);
            }
          }

          // Upload attachments if any
          if (savedItemId > 0 && Object.keys(attachmentFields).length > 0) {
            const uploadPromises: Promise<any>[] = [];
            
            Object.keys(attachmentFields).forEach((formFieldName) => {
              const attachments = attachmentFields[formFieldName];
              
              attachments.forEach((attachment: any) => {
                // Only upload files that haven't been uploaded yet (have file property)
                if (attachment.file && !attachment.id) {
                  const uploadPromise = apiService.uploadFile(
                    listName,
                    savedItemId,
                    attachment.file,
                    attachment.name,
                    listUrl
                  ).then((uploadResponse) => {
                    if (!uploadResponse.success) {
                      console.warn(`Failed to upload file ${attachment.name}:`, uploadResponse.error);
                    }
                    return uploadResponse;
                  });
                  
                  uploadPromises.push(uploadPromise);
                }
              });
            });
            
            // Wait for all uploads to complete
            if (uploadPromises.length > 0) {
              try {
                await Promise.all(uploadPromises);
                console.log(`Successfully uploaded ${uploadPromises.length} attachment(s)`);
              } catch (uploadError: any) {
                console.error('Error uploading attachments:', uploadError);
                // Don't throw - item was saved successfully, just attachments failed
              }
            }
          }

          if (config.onSaveSuccess) {
            config.onSaveSuccess(result);
          }
        }

        // Call custom onSubmit if provided
        if (config.onSubmit) {
          const customResult = await config.onSubmit(values);
          result = customResult || result;
        } else if (!autoSave) {
          // If no onSubmit and no autoSave, throw error
          throw new Error('No onSubmit handler or autoSave configured');
        }
      } catch (error: any) {
        console.error('Form submission error:', error);
        const errorMsg = error.message || 'Failed to submit form';
        
        if (config.onSaveError) {
          config.onSaveError(errorMsg);
        }
        
        if (config.onError) {
          config.onError(errors);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, errors, config, validate, autoSave, listName, itemId, listUrl, fieldMapping, apiService, setTouchedField, setAllValues, handleChange, handleBlur, reset, resetField, validateFieldByName, loadItemData, isLoading, itemData, setValue, getValue, setError]
  );

  const isValid = Object.keys(errors).length === 0 || Object.values(errors).every((error) => error === null);

  // Function to render custom field
  const renderCustomField = useCallback((name: string): React.ReactNode | null => {
    if (!config.onRenderField) {
      return null;
    }

    const fieldValue = values[name];
    const fieldError = errors[name] || null;
    const fieldTouched = touched[name] || false;

    const customProps: CustomFieldRenderProps = {
      name,
      value: fieldValue,
      error: fieldError,
      touched: fieldTouched,
      onChange: (value: any) => handleChange(name, value),
      onBlur: () => handleBlur(name),
      setValue,
      getValue,
      form: {
        values,
        errors,
        touched,
        isSubmitting,
        isLoading,
        isValid,
        itemData,
        itemId: itemId && itemId > 0 ? itemId : undefined,
        listName,
        listUrl,
        setValue,
        getValue,
        setError,
        setTouched: setTouchedField,
        setValues: setAllValues,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        resetField,
        validate,
        validateField: validateFieldByName,
        reloadItemData: loadItemData,
      },
    };

    return config.onRenderField(customProps);
  }, [config.onRenderField, values, errors, touched, handleChange, handleBlur, setValue, getValue, isSubmitting, isLoading, isValid, itemData, itemId, listName, listUrl, setTouchedField, setAllValues, handleSubmit, reset, resetField, validateFieldByName, loadItemData]);

  const contextValue: FormContextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    isLoading,
    isValid,
    itemData,
    itemId: itemId && itemId > 0 ? itemId : undefined,
    listName,
    listUrl,
    setValue,
    getValue,
    setError,
    setTouched: setTouchedField,
    setValues: setAllValues,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
    validate,
    validateField: validateFieldByName,
    reloadItemData: loadItemData,
    config,
    apiService, // Expose apiService so components can use it
    renderCustomField, // Expose custom field renderer
  };

  // Set global context
  useEffect(() => {
    setGlobalFormContext(contextValue);
    return () => {
      setGlobalFormContext(null);
    };
  }, [contextValue]);

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};

export const useFormContext = (): FormContextValue => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

// Export UseFormReturn type
export type { UseFormReturn };

