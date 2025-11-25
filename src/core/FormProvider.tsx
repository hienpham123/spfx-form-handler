import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { FormConfig, FormState, FormErrors, FormTouched, FormDirtyFields, UseFormReturn, CustomFieldRenderProps } from '../types';
import { validateForm, validateField } from '../utils/validation';
import { createSharePointApiService } from '../services/sharePointApiService/index';
import { extractWebUrl } from '../utils/formHelpers';
import { deepEqual } from '../utils/dirtyFields';
import { useFieldRegistration } from './hooks/useFieldRegistration';
import { useLoadItemData } from './hooks/useLoadItemData';
import { useFormSubmit } from './hooks/useFormSubmit';
import '../styles/custom.css';

export { registerSharePointWeb } from '../services/sharePointApiService/index';

interface FormContextValue extends UseFormReturn {
  config: FormConfig;
  apiService: {
    getItem: (listName: string, itemId: number, listUrl?: string, fieldNames?: string[]) => Promise<any>;
    addItem: (listName: string, data: any, listUrl?: string) => Promise<any>;
    updateItem: (listName: string, itemId: number, data: any, listUrl?: string) => Promise<any>;
    getListItems?: (listName: string, listUrl?: string) => Promise<any>;
    uploadFile?: (listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => Promise<any>;
    deleteFile?: (listName: string, itemId: number, fileName: string, listUrl?: string) => Promise<any>;
    getFieldMetadata?: (listName: string, fieldName: string, listUrl?: string) => Promise<any>;
    getListFields?: (listName: string, listUrl?: string) => Promise<any>;
    searchUsers?: (searchText: string, listUrl?: string) => Promise<any>;
    getUserById?: (userId: number, listUrl?: string) => Promise<any>;
    getAttachmentFiles?: (listName: string, itemId: number, listUrl?: string) => Promise<any>;
  };
  renderCustomField: (name: string) => React.ReactNode | null;
  registerField: (fieldName: string) => void;
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
  const [dirtyFields, setDirtyFields] = useState<FormDirtyFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [itemData, setItemData] = useState<any>(null);
  const [originalAttachments, setOriginalAttachments] = useState<any[]>([]);
  const initialValuesRef = useRef<FormState>(config.initialValues || {});

  const itemId = config.id !== undefined ? config.id : config.listConfig?.itemId;
  const listName = config.listName || config.listConfig?.listName;
  const listUrl = config.listUrl || config.listConfig?.listUrl;
  const userServiceUrl = config.userServiceUrl || extractWebUrl(listUrl);
  const fieldMapping = config.fieldMapping || config.listConfig?.fieldMapping || {};

  const { registeredFields, registeredFieldsRef, registerField } = useFieldRegistration();

  const autoSave = config.autoSave !== false && listName ? true : false;

  const customApiService = config.apiService || config.listConfig?.apiService;
  const autoApiService = listUrl && !customApiService
    ? createSharePointApiService(extractWebUrl(listUrl) || listUrl, () => Array.from(registeredFieldsRef.current))
    : null;
  const finalApiService = customApiService || autoApiService;

  if (!finalApiService) {
    throw new Error('API Service is required. Please provide either apiService in config or listUrl to auto-create SharePoint API service.');
  }

  const apiService: FormContextValue['apiService'] = {
    getItem: (finalApiService as any).getItem as (listName: string, itemId: number, listUrl?: string) => Promise<any>,
    addItem: ((finalApiService as any).addItem || (() => {
      throw new Error('addItem method is not available in API service');
    })) as (listName: string, data: any, listUrl?: string) => Promise<any>,
    updateItem: ((finalApiService as any).updateItem || (() => {
      throw new Error('updateItem method is not available in API service');
    })) as (listName: string, itemId: number, data: any, listUrl?: string) => Promise<any>,
    getListItems: (finalApiService as any).getListItems as ((listName: string, listUrl?: string) => Promise<any>) | undefined,
    uploadFile: (finalApiService as any).uploadFile as ((listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => Promise<any>) | undefined,
    deleteFile: (finalApiService as any).deleteFile as ((listName: string, itemId: number, fileName: string, listUrl?: string) => Promise<any>) | undefined,
    getFieldMetadata: (finalApiService as any).getFieldMetadata as ((listName: string, fieldName: string, listUrl?: string) => Promise<any>) | undefined,
    getListFields: (finalApiService as any).getListFields as ((listName: string, listUrl?: string) => Promise<any>) | undefined,
    searchUsers: (finalApiService as any).searchUsers as ((searchText: string, listUrl?: string) => Promise<any>) | undefined,
    getUserById: (finalApiService as any).getUserById as ((userId: number, listUrl?: string) => Promise<any>) | undefined,
    getAttachmentFiles: (finalApiService as any).getAttachmentFiles as ((listName: string, itemId: number, listUrl?: string) => Promise<any>) | undefined,
  };

  const setInitialValuesRef = useCallback((newValues: FormState) => {
    initialValuesRef.current = { ...newValues };
    setDirtyFields({});
  }, []);

  const loadItemData = useLoadItemData({
    itemId,
    listName,
    listUrl,
    fieldMapping,
    apiService,
    registeredFields,
    config: {
      initialValues: config.initialValues,
      onItemLoaded: config.onItemLoaded,
      onLoadError: config.onLoadError,
    },
    setIsLoading,
    setItemData,
    setOriginalAttachments,
    setValues,
    setInitialValuesRef,
  });

  useEffect(() => {
    if (config.enableReinitialize && config.initialValues) {
      setValues(config.initialValues);
      setErrors({});
      setTouched({});
      initialValuesRef.current = { ...config.initialValues };
      setDirtyFields({});
    }
  }, [config.initialValues, config.enableReinitialize]);

  useEffect(() => {
    if (!config.initialValues || Object.keys(config.initialValues).length === 0) {
      initialValuesRef.current = { ...values };
    } else {
      initialValuesRef.current = { ...config.initialValues };
    }
  }, []);

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
    initialValuesRef.current = { ...newValues };
    setDirtyFields({});
  }, []);

  const handleChange = useCallback(
    (name: string, value: any) => {
      setValue(name, value);
      setTouchedField(name, true);

      const error = validateField(value, config.validationSchema?.[name]);
      setError(name, error);

      setDirtyFields((prev) => {
        const initialValue = initialValuesRef.current[name];
        const isDirty = !deepEqual(value, initialValue);
        if (isDirty) {
          return { ...prev, [name]: true };
        } else {
          const newDirty = { ...prev };
          delete newDirty[name];
          return newDirty;
        }
      });
    },
    [config.validationSchema, setValue, setError, setTouchedField]
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
    const resetValues = config.initialValues || {};
    setValues(resetValues);
    setErrors({});
    setTouched({});
    initialValuesRef.current = { ...resetValues };
    setDirtyFields({});
  }, [config.initialValues]);

  const resetField = useCallback(
    (name: string) => {
      const defaultValue = initialValuesRef.current[name] ?? config.initialValues?.[name];
      setValue(name, defaultValue);
      setError(name, null);
      setTouchedField(name, false);
      setDirtyFields((prev) => {
        const newDirty = { ...prev };
        delete newDirty[name];
        return newDirty;
      });
    },
    [config.initialValues, setValue, setError, setTouchedField]
  );

  const formHelpers = {
    setValue,
    getValue,
    setError,
    setTouched: setTouchedField,
    setValues: setAllValues,
    handleChange,
    handleBlur,
    reset,
    resetField,
    validate,
    validateField: validateFieldByName,
  };

  const handleSubmit = useFormSubmit({
    values,
    errors,
    touched,
    dirtyFields,
    itemId,
    listName,
    listUrl,
    fieldMapping,
    autoSave,
    apiService,
    itemData,
    originalAttachments,
    config,
    setIsSubmitting,
    setErrors,
    setTouched,
    setDirtyFields,
    setItemData,
    setAllValues,
    validate,
    loadItemData,
    formHelpers,
  });

  const isValid = Object.keys(errors).length === 0 || Object.values(errors).every((error) => error === null);

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
        dirtyFields,
        isSubmitting,
        isLoading,
        isValid,
        itemData,
        itemId: itemId && itemId > 0 ? itemId : undefined,
        listName,
        listUrl,
        userServiceUrl,
        ...formHelpers,
        handleSubmit,
        reloadItemData: loadItemData,
        registerField,
      },
    };

    return config.onRenderField(customProps);
  }, [config.onRenderField, values, errors, touched, handleChange, handleBlur, setValue, getValue, isSubmitting, isLoading, isValid, itemData, itemId, listName, listUrl, userServiceUrl, formHelpers, handleSubmit, loadItemData, registerField]);

  const contextValue: FormContextValue = {
    values,
    errors,
    touched,
    dirtyFields,
    isSubmitting,
    isLoading,
    isValid,
    itemData,
    itemId: itemId && itemId > 0 ? itemId : undefined,
    listName,
    listUrl,
    userServiceUrl,
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
    apiService,
    renderCustomField,
    registerField,
  };

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

export type { UseFormReturn };
