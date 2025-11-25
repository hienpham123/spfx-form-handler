import React from 'react';
import {
  FormProvider,
  useForm,
  FormField,
  registerSharePointWeb, // ✅ Register Web class để FormProvider có thể tự động tạo apiService
} from '../src';
import { PrimaryButton, Stack, MessageBar, MessageBarType, Spinner, Text } from '@fluentui/react';
import { Web } from '@pnp/sp';

// ✅ Register Web class để FormProvider có thể tự động tạo apiService
registerSharePointWeb(Web);

const RealWorldForm: React.FC = () => {
  const form = useForm();

  if (form.isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner label="Loading project data..." />
      </div>
    );
  }

  // Check if running in SharePoint page
  const isInSharePoint = typeof window !== 'undefined' &&
    (!!(window as any)._spPageContextInfo || window.location.href.includes('sharepoint.com'));

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Project Form - Real SharePoint Example</h1>
      {!isInSharePoint && (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline style={{ marginBottom: 16 }}>
          ⚠️ <strong>Warning:</strong> Running standalone. To avoid 403 errors, please run this app in a SharePoint page.
          <br />
          Cookies authentication only works when the app is embedded in a SharePoint page.
        </MessageBar>
      )}
      <p>
        <strong>List:</strong> {form.listName || 'Projects'}<br />
        <strong>Site:</strong> {form.listUrl || 'https://hieho.sharepoint.com/sites'}<br />
        <strong>Mode:</strong> {form.itemId ? `Edit Item #${form.itemId}` : 'Create New'}
      </p>

      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 16 }}>
          {/* Chỉ cần truyền Internal Field Name từ SharePoint */}
          {/* FormField sẽ tự động detect type và render đúng component */}

          <FormField fieldName="Title" />

          <FormField fieldName="ItemType" />

          <FormField fieldName="StartDate" />

          <FormField fieldName="Owner" />

          <FormField fieldName="IsActive" />

          <FormField fieldName="CostCode" />

          <FormField fieldName="Link" />

          <FormField fieldName="Attachments" />

          {/* Display form state for debugging */}
          <div style={{ padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
            <Text variant="small" style={{ fontWeight: 600, marginBottom: 8 }}>
              Form State:
            </Text>
            <div style={{ fontSize: 11 }}>
              <div><strong>Valid:</strong> {form.isValid ? 'Yes' : 'No'}</div>
              <div><strong>Submitting:</strong> {form.isSubmitting ? 'Yes' : 'No'}</div>
              <div><strong>Errors:</strong> {Object.keys(form.errors).filter(k => form.errors[k]).length}</div>
            </div>
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>View Form Values</summary>
              <pre style={{ fontSize: 11, overflow: 'auto', maxHeight: 200, margin: '8px 0 0 0' }}>
                {JSON.stringify(form.values, null, 2)}
              </pre>
            </details>
          </div>

          <div>
            <PrimaryButton
              type="submit"
              text={form.itemId ? "Update Project" : "Create Project"}
              disabled={form.isSubmitting}
            />
          </div>
        </Stack>
      </form>
    </div>
  );
};

const RealWorldApp: React.FC = () => {
  // ✅ Không cần tạo apiService nữa - FormProvider sẽ tự động tạo từ listUrl

  return (
    <FormProvider
      config={{
        // ✅ Chỉ cần truyền id, listName, listUrl và fields
        // ✅ apiService sẽ tự động được tạo từ listUrl (không cần truyền vào nữa)
        id: 3, // 0 = new, > 0 = edit existing
        listName: 'DemoList', // ✅ SharePoint list name
        listUrl: 'http://localhost:8080/sites/Developer', // ✅ Web URL hoặc List URL - tự động tạo apiService từ đây
        // userServiceUrl: 'https://hieho.sharepoint.com/sites', // Optional: Web URL riêng cho user search (auto-extracted từ listUrl nếu không có)

        // Auto save to SharePoint
        autoSave: true,

        // Validation (optional)
        validationSchema: {
          Title: {
            required: true,
            minLength: 3,
          },
          ItemType: {
            required: true,
            minLength: 3,
          },
          StartDate: {
            required: true,
          },
          Owner: {
            required: true,
          },
          CostCode: {
            required: true,
          },
          Link: {
            required: true,
          },
          Attachments: {
            required: true,
          },
        },

        // Transform data before saving
        onBeforeSave: (values) => {
          console.log('Original values:', values);

          // Transform data before saving to SharePoint
          return {
            ...values,
          };
        },

        // Custom validation before save
        onValidSave: (form) => {
          console.log('Validating before save...');

          // Check if form is valid
          if (!form.isValid) {
            console.log('Form validation failed');
            return false;
          }

          // Business rule: End date must be after start date
          if (form.values.StartDate && form.values.EndDate) {
            const start = new Date(form.values.StartDate);
            const end = new Date(form.values.EndDate);
            if (start > end) {
              form.setError('EndDate', {
                message: 'End date must be after start date',
                type: 'custom'
              });
              return false;
            }
          }

          // Business rule: Draft items must have description
          if (form.values.Status === 'Draft' && !form.values.Description) {
            form.setError('Description', {
              message: 'Description is required for draft projects',
              type: 'required'
            });
            return false;
          }

          console.log('Custom validation passed');
          return true; // Allow save
        },

        // Callbacks
        onItemLoaded: (itemData) => {
          console.log('Project loaded:', itemData);
        },
        onSaveSuccess: (data) => {
          console.log('Project saved:', data);
          alert(`Project ${data.Id ? 'updated' : 'created'} successfully!`);
        },
        onSaveError: (error) => {
          console.error('Save failed:', error);
          alert(`Error: ${error}`);
        },
      }}
    >
      <RealWorldForm />
    </FormProvider>
  );
};

export default RealWorldApp;

