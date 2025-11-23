import React from 'react';
import {
  FormProvider,
  useForm,
  FormField,
} from '../src';
import { PrimaryButton, Stack, Text } from '@fluentui/react';

/**
 * Example: Using FormField to automatically render fields based on SharePoint field types
 * 
 * FormField automatically detects field type from SharePoint and renders the correct component
 */
const AutoForm: React.FC = () => {
  const form = useForm();

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Auto Form Field Example</h1>
      <p>
        FormField automatically detects SharePoint field types and renders the correct component.
        Just pass the Internal Field Name from SharePoint list.
      </p>

      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 16 }}>
          {/* Title field - will render as TextField */}
          <FormField fieldName="Title" />

          {/* Category field - will render as FormLookup */}
          <FormField fieldName="Category" />

          {/* Status field - will render as FormDropdown (Choice field) */}
          <FormField fieldName="Status" />

          {/* Description field - will render as TextField (multiline for Note) */}
          <FormField fieldName="Description" />

          {/* StartDate field - will render as FormDatePicker */}
          <FormField fieldName="StartDate" />

          {/* IsActive field - will render as FormCheckbox */}
          <FormField fieldName="IsActive" />

          {/* AssignedTo field - will render as FormUserPicker */}
          <FormField fieldName="AssignedTo" />

          {/* Attachments field - will render as FormAttachmentPicker */}
          <FormField fieldName="Attachments" />

          {/* Display form values */}
          <div style={{ padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
            <h3>Form Values:</h3>
            <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 300 }}>
              {JSON.stringify(form.values, null, 2)}
            </pre>
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

const FormFieldApp: React.FC = () => {
  return (
    <FormProvider
      config={{
        listName: 'Projects',
        listUrl: 'https://hieho.sharepoint.com/sites/apps',
        id: 0, // New item
        autoSave: true,
        validationSchema: {
          Title: { required: true, minLength: 3 },
        },
        onSaveSuccess: (data) => {
          console.log('Item saved:', data);
          alert('Item saved successfully!');
        },
        onSaveError: (error) => {
          console.error('Save failed:', error);
          alert(`Error: ${error}`);
        },
      }}
    >
      <AutoForm />
    </FormProvider>
  );
};

export default FormFieldApp;

