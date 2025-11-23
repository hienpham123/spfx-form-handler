import React, { ComponentType } from 'react';
import { useFormContext } from './FormProvider';
import { UseFormReturn } from '../types';

export interface WithFormProps {
  form: UseFormReturn;
}

/**
 * Higher-Order Component to inject form context into class components
 * 
 * @example
 * ```tsx
 * class MyComponent extends React.Component<WithFormProps> {
 *   render() {
 *     const { form } = this.props;
 *     return (
 *       <div>
 *         <input
 *           value={form.values.name || ''}
 *           onChange={(e) => form.handleChange('name', e.target.value)}
 *         />
 *       </div>
 *     );
 *   }
 * }
 * 
 * export default withForm(MyComponent);
 * ```
 */
export function withForm<P extends object>(
  Component: ComponentType<P & WithFormProps>
): ComponentType<P> {
  const WithFormComponent = (props: P) => {
    const form = useFormContext();
    return <Component {...props} form={form} />;
  };

  WithFormComponent.displayName = `withForm(${Component.displayName || Component.name || 'Component'})`;

  return WithFormComponent;
}

/**
 * Render prop component for class components
 * 
 * @example
 * ```tsx
 * <FormConsumer>
 *   {(form) => (
 *     <input
 *       value={form.values.name || ''}
 *       onChange={(e) => form.handleChange('name', e.target.value)}
 *     />
 *   )}
 * </FormConsumer>
 * ```
 */
interface FormConsumerProps {
  children: (form: UseFormReturn) => React.ReactNode;
}

export const FormConsumer: React.FC<FormConsumerProps> = ({ children }) => {
  const form = useFormContext();
  return <>{children(form)}</>;
};

