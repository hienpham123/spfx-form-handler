import React from 'react';
import {
  FormProvider,
  useForm,
  FormField,
} from '../src';
import { PrimaryButton, Stack, MessageBar, MessageBarType, Spinner, Text } from '@fluentui/react';

/**
 * Real World Example: Using FormField with actual SharePoint
 * 
 * Chỉ cần truyền endpoint và listName, FormField sẽ tự động:
 * - Load field metadata từ SharePoint
 * - Render đúng component dựa trên field type
 * - Load options cho Choice/Lookup fields
 * 
 * Endpoint: https://hieho.sharepoint.com/sites/apps
 * List Name: Projects
 */
const RealWorldForm: React.FC = () => {
  const form = useForm();

  if (form.isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <Spinner label="Loading project data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Project Form - Real SharePoint Example</h1>
      <p>
        <strong>List:</strong> {form.listName || 'Projects'}<br />
        <strong>Site:</strong> {form.listUrl || 'https://hieho.sharepoint.com/sites/apps'}<br />
        <strong>Mode:</strong> {form.itemId ? `Edit Item #${form.itemId}` : 'Create New'}
      </p>

      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 16 }}>
          {/* Chỉ cần truyền Internal Field Name từ SharePoint */}
          {/* FormField sẽ tự động detect type và render đúng component */}
          
          <FormField fieldName="Title" />
          
          <FormField fieldName="ProjectCode" />
          
          <FormField fieldName="StartDate" />
          
          <FormField fieldName="EndDate" />
          
          <FormField fieldName="Status" />
          
          <FormField fieldName="Category" />
          
          <FormField fieldName="AssignedTo" />
          
          <FormField fieldName="Description" />
          
          <FormField fieldName="IsActive" />
          
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
  // In real SPFx project, you would get context from props
  // const { context } = props;
  // 
  // Initialize SPFx:
  // import { sp } from '@pnp/sp';
  // sp.setup({ spfxContext: context });

  // Real API service configuration for SharePoint
  // Uncomment and use when you have SPFx context
  const realApiService = {
    getItem: async (listName: string, itemId: number, listUrl?: string) => {
      // Real SPFx implementation:
      /*
      import { sp } from '@pnp/sp';
      
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const item = await web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .get();
      
      return { success: true, data: item };
      */
      
      // Mock for demo (remove in production)
      return {
        success: true,
        data: {
          Id: itemId,
          Title: `Project ${itemId}`,
          ProjectCode: `PRJ-${itemId}`,
          StartDate: new Date().toISOString(),
          Status: 'Active',
        },
      };
    },

    addItem: async (listName: string, data: any, listUrl?: string) => {
      // Real SPFx implementation:
      /*
      import { sp } from '@pnp/sp';
      
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const result = await web
        .lists.getByTitle(listName)
        .items.add(data);
      
      return { success: true, data: result.data };
      */
      
      // Mock for demo (remove in production)
      return {
        success: true,
        data: {
          ...data,
          Id: Math.floor(Math.random() * 1000),
        },
      };
    },

    updateItem: async (listName: string, itemId: number, data: any, listUrl?: string) => {
      // Real SPFx implementation:
      /*
      import { sp } from '@pnp/sp';
      
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      await web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .update(data);
      
      const updated = await web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .get();
      
      return { success: true, data: updated };
      */
      
      // Mock for demo (remove in production)
      return {
        success: true,
        data: {
          ...data,
          Id: itemId,
        },
      };
    },

    getListItems: async (listName: string, listUrl?: string) => {
      // Real SPFx implementation:
      /*
      import { sp } from '@pnp/sp';
      
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const items = await web
        .lists.getByTitle(listName)
        .items
        .select('Id', 'Title')
        .get();
      
      return { success: true, data: items };
      */
      
      // Mock for demo (remove in production)
      return {
        success: true,
        data: [
          { Id: 1, Title: 'Option 1' },
          { Id: 2, Title: 'Option 2' },
        ],
      };
    },

    uploadFile: async (listName: string, itemId: number, file: File, fileName?: string, listUrl?: string) => {
      // Real SPFx implementation:
      /*
      import { sp } from '@pnp/sp';
      
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const attachmentFolder = web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .attachmentFiles;
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await attachmentFolder.add(fileName || file.name, arrayBuffer);
      
      return { success: true, data: result.data };
      */
      
      // Mock for demo (remove in production)
      return {
        success: true,
        data: {
          FileName: fileName || file.name,
          ServerRelativeUrl: `/Lists/${listName}/Attachments/${itemId}/${fileName || file.name}`,
        },
      };
    },

    getFieldMetadata: async (listName: string, fieldName: string, listUrl?: string) => {
      // Real SPFx implementation:
      /*
      import { sp } from '@pnp/sp';
      
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const field = await web
        .lists.getByTitle(listName)
        .fields
        .getByInternalNameOrTitle(fieldName)
        .get();
      
      // Map SharePoint field to our metadata format
      const metadata = {
        InternalName: field.InternalName,
        Title: field.Title,
        Type: field.TypeAsString || field.Type,
        Required: field.Required || false,
        ReadOnlyField: field.ReadOnlyField || false,
        Choices: field.Choices || undefined,
        LookupListId: field.LookupListId || undefined,
        LookupListName: field.LookupList || undefined,
        LookupFieldName: field.LookupField || undefined,
        DefaultValue: field.DefaultValue || undefined,
        Description: field.Description || undefined,
        MaxLength: field.MaxLength || undefined,
        Min: field.Min || undefined,
        Max: field.Max || undefined,
      };
      
      return { success: true, data: metadata };
      */
      
      // Mock for demo (remove in production)
      const mockMetadata: any = {
        Title: {
          InternalName: 'Title',
          Title: 'Title',
          Type: 'Text',
          Required: true,
          ReadOnlyField: false,
          MaxLength: 255,
        },
        ProjectCode: {
          InternalName: 'ProjectCode',
          Title: 'Project Code',
          Type: 'Text',
          Required: true,
          ReadOnlyField: false,
        },
        StartDate: {
          InternalName: 'StartDate',
          Title: 'Start Date',
          Type: 'DateTime',
          Required: false,
          ReadOnlyField: false,
        },
        EndDate: {
          InternalName: 'EndDate',
          Title: 'End Date',
          Type: 'DateTime',
          Required: false,
          ReadOnlyField: false,
        },
        Status: {
          InternalName: 'Status',
          Title: 'Status',
          Type: 'Choice',
          Required: false,
          ReadOnlyField: false,
          Choices: ['Active', 'On Hold', 'Completed', 'Cancelled'],
        },
        Category: {
          InternalName: 'Category',
          Title: 'Category',
          Type: 'Lookup',
          Required: false,
          ReadOnlyField: false,
          LookupListName: 'Categories',
          LookupFieldName: 'Title',
        },
        AssignedTo: {
          InternalName: 'AssignedTo',
          Title: 'Assigned To',
          Type: 'User',
          Required: false,
          ReadOnlyField: false,
        },
        Description: {
          InternalName: 'Description',
          Title: 'Description',
          Type: 'Note',
          Required: false,
          ReadOnlyField: false,
        },
        IsActive: {
          InternalName: 'IsActive',
          Title: 'Is Active',
          Type: 'Boolean',
          Required: false,
          ReadOnlyField: false,
        },
        Attachments: {
          InternalName: 'Attachments',
          Title: 'Attachments',
          Type: 'Attachment',
          Required: false,
          ReadOnlyField: false,
        },
      };

      return {
        success: true,
        data: mockMetadata[fieldName] || {
          InternalName: fieldName,
          Title: fieldName,
          Type: 'Text',
          Required: false,
          ReadOnlyField: false,
        },
      };
    },
  };

  return (
    <FormProvider
      config={{
        // Chỉ cần truyền endpoint và listName
        id: 0, // 0 = new, > 0 = edit existing
        listName: 'Projects', // ✅ SharePoint list name
        listUrl: 'https://hieho.sharepoint.com/sites/apps', // ✅ Endpoint
        
        // Real API service - uncomment và config khi có SPFx context
        apiService: realApiService,
        
        // Auto save to SharePoint
        autoSave: true,
        
        // Validation (optional)
        validationSchema: {
          Title: {
            required: true,
            minLength: 3,
          },
        },
        
        // Transform data before saving
        onBeforeSave: (values) => {
          console.log('Original values:', values);
          
          // Transform data before saving to SharePoint
          return {
            ...values,
            // Format dates to ISO string
            StartDate: values.StartDate ? new Date(values.StartDate).toISOString() : null,
            EndDate: values.EndDate ? new Date(values.EndDate).toISOString() : null,
            // Add computed fields
            Modified: new Date().toISOString(),
            // Ensure required fields have defaults
            Status: values.Status || 'Draft',
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

