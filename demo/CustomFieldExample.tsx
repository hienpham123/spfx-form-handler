import React from 'react';
import {
  FormProvider,
  useForm,
  FormTextField,
  FormCustomField,
  FormDropdown,
} from '../src';
import { PrimaryButton, Stack, Text, Toggle } from '@fluentui/react';

/**
 * Example: Custom Field Rendering with onRenderField
 * 
 * This demonstrates how to use onRenderField to create custom input fields
 * and use setValue to update form data programmatically
 */
const CustomFieldForm: React.FC = () => {
  const form = useForm();

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Custom Field Example</h1>
      <p>This example shows how to use onRenderField to create custom input fields.</p>

      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 16 }}>
          {/* Standard field */}
          <FormTextField
            name="title"
            label="Title"
            required
          />

          {/* Custom field - rendered using onRenderField */}
          <FormCustomField
            name="customInput"
            fallback={<Text>Custom field not configured</Text>}
          />

          {/* Another custom field with complex logic */}
          <FormCustomField
            name="price"
            fallback={<Text>Price field not configured</Text>}
          />

          {/* Standard dropdown */}
          <FormDropdown
            name="status"
            label="Status"
            options={[
              { key: 'Active', text: 'Active' },
              { key: 'Inactive', text: 'Inactive' },
            ]}
          />

          {/* Display form values */}
          <div style={{ padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
            <h3>Form Values:</h3>
            <pre>{JSON.stringify(form.values, null, 2)}</pre>
          </div>

          <PrimaryButton
            type="submit"
            text="Submit"
            disabled={form.isSubmitting}
          />
        </Stack>
      </form>
    </div>
  );
};

const CustomFieldApp: React.FC = () => {
  return (
    <FormProvider
      config={{
        initialValues: {
          title: '',
          customInput: '',
          price: 0,
          status: undefined,
        },
        validationSchema: {
          title: { required: true },
          customInput: { required: true, minLength: 3 },
          price: { required: true, min: 0 },
        },
        // Custom field rendering function
        onRenderField: ({ name, value, onChange, onBlur, error, touched, setValue, getValue, form }) => {
          // Custom input field
          if (name === 'customInput') {
            return (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Custom Input <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: error && touched ? '1px solid red' : '1px solid #ccc',
                      borderRadius: 4,
                    }}
                    placeholder="Enter custom value"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Use setValue to set a default value
                      setValue('customInput', 'Default Value');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0078d4',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Set Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Use setValue to copy from another field
                      const titleValue = getValue('title');
                      setValue('customInput', titleValue || '');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#107c10',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Copy from Title
                  </button>
                </div>
                {error && touched && (
                  <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
                    {error.message}
                  </div>
                )}
              </div>
            );
          }

          // Custom price field with currency formatting
          if (name === 'price') {
            return (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Price <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>$</span>
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => {
                      const numValue = parseFloat(e.target.value) || 0;
                      onChange(numValue);
                    }}
                    onBlur={onBlur}
                    min={0}
                    step={0.01}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: error && touched ? '1px solid red' : '1px solid #ccc',
                      borderRadius: 4,
                    }}
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // Calculate 10% discount
                      const currentPrice = getValue('price') || 0;
                      const discountedPrice = currentPrice * 0.9;
                      setValue('price', Math.round(discountedPrice * 100) / 100);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#d13438',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Apply 10% Off
                  </button>
                </div>
                {error && touched && (
                  <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
                    {error.message}
                  </div>
                )}
                {value && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Formatted: ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            );
          }

          // Return null to use default component for other fields
          return null;
        },
        onSubmit: async (values) => {
          console.log('Form submitted with values:', values);
          alert(`Form submitted!\n\nCustom Input: ${values.customInput}\nPrice: $${values.price}`);
        },
      }}
    >
      <CustomFieldForm />
    </FormProvider>
  );
};

export default CustomFieldApp;

