import React, { useState } from 'react';
import {
  FormProvider,
  useForm,
  FormTextField,
  FormDropdown,
  FormDatePicker,
  FormUserPicker,
  mockApi,
} from '../src';
import { PrimaryButton, Stack, MessageBar, MessageBarType, Spinner } from '@fluentui/react';

/**
 * Example: Form with SharePoint List Configuration
 * This demonstrates how to load form data from a SharePoint list item
 */
const FormWithListConfig: React.FC = () => {
  const [submitResult, setSubmitResult] = useState<{ type: MessageBarType; message: string } | null>(null);
  const form = useForm();

  const handleSubmit = async (values: any) => {
    try {
      // In real SPFx, you would update the list item here
      const response = await mockApi.patch(`/lists/MyList/items/${form.itemData?.Id}`, values);
      
      if (response.success) {
        setSubmitResult({
          type: MessageBarType.success,
          message: `Item updated successfully! ID: ${form.itemData?.Id}`,
        });
      } else {
        throw new Error(response.error || 'Failed to update item');
      }
    } catch (error: any) {
      setSubmitResult({
        type: MessageBarType.error,
        message: `Error: ${error.message}`,
      });
    }
  };

  if (form.isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner label="Loading item data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Form with SharePoint List Configuration</h1>
      <p>This form automatically loads data from SharePoint list item ID: 1</p>

      {submitResult && (
        <MessageBar
          messageBarType={submitResult.type}
          onDismiss={() => setSubmitResult(null)}
          style={{ marginBottom: 20 }}
        >
          {submitResult.message}
        </MessageBar>
      )}

      {form.itemData && (
        <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: 20 }}>
          Loaded item data. Original item ID: {form.itemData.Id}
        </MessageBar>
      )}

      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 16 }}>
          <FormTextField
            name="Title"
            label="Title"
            required
          />

          <FormTextField
            name="Description"
            label="Description"
            multiline
            rows={4}
          />

          <FormDropdown
            name="Status"
            label="Status"
            options={[
              { key: 'Active', text: 'Active' },
              { key: 'Inactive', text: 'Inactive' },
              { key: 'Pending', text: 'Pending' },
            ]}
          />

          <FormDatePicker
            name="StartDate"
            label="Start Date"
          />

          <FormUserPicker
            name="AssignedTo"
            label="Assigned To"
          />

          <div>
            <PrimaryButton
              type="submit"
              text="Update Item"
              disabled={form.isSubmitting}
              style={{ marginRight: 8 }}
            />
            <PrimaryButton
              type="button"
              text="Reload Data"
              onClick={form.reloadItemData}
              disabled={form.isLoading}
              style={{ marginRight: 8 }}
            />
            <PrimaryButton
              type="button"
              text="Reset"
              onClick={form.reset}
              disabled={form.isSubmitting}
            />
          </div>

          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
            <h3>Form State:</h3>
            <pre style={{ fontSize: 12, overflow: 'auto' }}>
              {JSON.stringify(
                {
                  values: form.values,
                  isLoading: form.isLoading,
                  itemData: form.itemData,
                  isValid: form.isValid,
                },
                null,
                2
              )}
            </pre>
          </div>
        </Stack>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        listConfig: {
          listName: 'MyList',
          itemId: 1, // Load item with ID 1
          // listUrl: 'https://yourtenant.sharepoint.com/sites/yoursite', // Optional
          fieldMapping: {
            // Map SharePoint field names to form field names if needed
            // 'SPFieldName': 'formFieldName'
          },
          // apiService: {
          //   getItem: async (listName, itemId, listUrl) => {
          //     // Custom API service for real SPFx
          //     const response = await sp.web.lists.getByTitle(listName).items.getById(itemId).get();
          //     return { success: true, data: response };
          //   },
          // },
        },
        validationSchema: {
          Title: {
            required: true,
            minLength: 3,
          },
        },
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
          // This will be handled by FormWithListConfig component
          console.log('Form submitted with values:', values);
        },
        onItemLoaded: (itemData) => {
          console.log('Item data loaded:', itemData);
        },
        onLoadError: (error) => {
          console.error('Failed to load item:', error);
        },
      }}
    >
      <FormWithListConfig />
    </FormProvider>
  );
};

export default App;

