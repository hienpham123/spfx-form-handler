import { useCallback } from 'react';
import { FormState, FormErrors, FormTouched } from '../../types';
import { validateForm, validateField } from '../../utils/validation';
import { mapFormDataToSharePoint } from '../../utils/formHelpers';

interface UseFormSubmitProps {
  values: FormState;
  errors: FormErrors;
  touched: FormTouched;
  dirtyFields: Record<string, boolean>;
  itemId?: number;
  listName?: string;
  listUrl?: string;
  fieldMapping: Record<string, string>;
  autoSave: boolean;
  apiService: any;
  itemData?: any;
  originalAttachments?: any[];
  config: {
    validationSchema?: any;
    onBeforeSave?: (values: FormState) => FormState | Promise<FormState>;
    onValidSave?: (form: any) => boolean;
    onSaveSuccess?: (data: any) => void;
    onSaveError?: (error: string) => void;
    onSubmit?: (values: FormState) => any | Promise<any>;
    onError?: (errors: FormErrors) => void;
  };
  setIsSubmitting: (submitting: boolean) => void;
  setErrors: (errors: FormErrors) => void;
  setTouched: (touched: FormTouched) => void;
  setDirtyFields: (dirtyFields: Record<string, boolean>) => void;
  setItemData: (data: any) => void;
  setAllValues: (values: FormState) => void;
  validate: () => boolean;
  loadItemData: () => Promise<void>;
  formHelpers: any;
}

export const useFormSubmit = ({
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
}: UseFormSubmitProps) => {
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const allFields = Object.keys(config.validationSchema || {});
      const newTouched: FormTouched = {};
      allFields.forEach((field) => {
        newTouched[field] = true;
      });
      setTouched(newTouched);

      const isValid = validate();

      let canSave = isValid;
      if (config.onValidSave) {
        const formContext = {
          ...formHelpers,
          values,
          errors,
          touched,
          isValid,
          itemId: itemId && itemId > 0 ? itemId : undefined,
          listName,
          listUrl,
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
        let dataToSave = values;
        if (config.onBeforeSave) {
          dataToSave = await config.onBeforeSave(values);
        }

        let result: any;

        if (autoSave && listName) {
          const dirtyFieldNames = Object.keys(dirtyFields).filter(key => dirtyFields[key]);
          const { spData, filesToUpload, filesToDelete } = mapFormDataToSharePoint(
            dataToSave, 
            fieldMapping, 
            originalAttachments,
            itemId && itemId > 0 ? dirtyFieldNames : undefined
          );

          let savedItemId: number;

          if (itemId && itemId > 0) {
            const response = await apiService.updateItem(listName, itemId, spData, listUrl);
            if (!response.success) {
              throw new Error(response.error || 'Failed to update item');
            }
            result = response.data;
            savedItemId = itemId;
            setItemData(response.data);
          } else {
            const response = await apiService.addItem(listName, spData, listUrl);
            if (!response.success) {
              throw new Error(response.error || 'Failed to create item');
            }
            result = response.data;
            savedItemId = result.Id || itemId || 0;

            if (result.Id) {
              setItemData(result);
            }
          }

          if (savedItemId > 0) {
            for (let i = 0; i < filesToDelete.length; i++) {
              const { fileName } = filesToDelete[i];
              try {
                if (apiService.deleteFile) {
                  await apiService.deleteFile(listName, savedItemId, fileName, listUrl);
                }
                if (i < filesToDelete.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              } catch (error: any) {
                // Continue with other files
              }
            }

            for (let i = 0; i < filesToUpload.length; i++) {
              const { attachment } = filesToUpload[i];
              try {
                await apiService.uploadFile(
                  listName,
                  savedItemId,
                  attachment.file,
                  attachment.name,
                  listUrl
                );
                if (i < filesToUpload.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              } catch (error: any) {
                // Continue with other files
              }
            }
          }

          if (config.onSaveSuccess) {
            config.onSaveSuccess(result);
          }

          setDirtyFields({});
        }

        if (config.onSubmit) {
          const customResult = await config.onSubmit(values);
          result = customResult || result;
        } else if (!autoSave) {
          throw new Error('No onSubmit handler or autoSave configured');
        }
      } catch (error: any) {
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
    [
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
    ]
  );

  return handleSubmit;
};

