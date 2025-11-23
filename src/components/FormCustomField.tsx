import React from 'react';
import { useFormContext } from '../core/FormProvider';

export interface FormCustomFieldProps {
  name: string;
  fallback?: React.ReactNode; // Fallback component if onRenderField is not provided
}

/**
 * FormCustomField component - Renders custom field using onRenderField from FormProvider config
 * 
 * @example
 * ```tsx
 * // In FormProvider config
 * <FormProvider
 *   config={{
 *     onRenderField: ({ name, value, onChange, setValue, form }) => {
 *       if (name === 'customField') {
 *         return (
 *           <div>
 *             <input
 *               value={value || ''}
 *               onChange={(e) => onChange(e.target.value)}
 *             />
 *             <button onClick={() => setValue('customField', 'default')}>
 *               Reset
 *             </button>
 *           </div>
 *         );
 *       }
 *       return null; // Return null to use default component
 *     },
 *   }}
 * >
 *   <FormCustomField name="customField" />
 * </FormProvider>
 * ```
 */
export const FormCustomField: React.FC<FormCustomFieldProps> = ({ name, fallback }) => {
  const { renderCustomField } = useFormContext();

  const customRender = renderCustomField(name);

  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // If no custom render, show fallback or nothing
  return fallback ? <>{fallback}</> : null;
};

