// Core exports
export { FormProvider, useFormContext, setGlobalFormContext, getGlobalFormContext, registerSharePointWeb } from './core/FormProvider';
export { useForm, useField } from './core/hooks';
export { withForm, FormConsumer } from './core/hoc';
export type { WithFormProps } from './core/hoc';

// Component exports
export {
  FormTextField,
  FormDropdown,
  FormDatePicker,
  FormCheckbox,
  FormMultiChoice,
  FormLookup,
  FormUserPicker,
  FormAttachmentPicker,
  FormCustomField,
  FormField,
} from './components';
export type {
  FormTextFieldProps,
  FormDropdownProps,
  FormDatePickerProps,
  FormCheckboxProps,
  FormMultiChoiceProps,
  FormMultiChoiceOption,
  FormLookupProps,
  FormUserPickerProps,
  UserInfo,
  FormAttachmentPickerProps,
  AttachmentInfo,
  FormCustomFieldProps,
  FormFieldProps,
} from './components';

// Type exports
export type {
  FieldType,
  SharePointFieldType,
  SharePointFieldMetadata,
  ValidationRule,
  FieldError,
  FormFieldConfig,
  FormState,
  FormErrors,
  FormTouched,
  FormConfig,
  CustomFieldRenderProps,
  SharePointListConfig,
  UseFormReturn,
  UseFieldReturn,
  ApiResponse,
} from './types';

// Service exports
export { createSpfxApiService as createSpfxApiServiceFromPnp, createSpfxRestApiService } from './services/spfxApiService';

// Import styles
import './styles.css';

