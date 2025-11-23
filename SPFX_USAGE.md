# SPFx Real Usage Guide

Hướng dẫn sử dụng thư viện trong dự án SPFx thực tế.

## Cài đặt

```bash
npm install spfx-form-handler @pnp/sp @pnp/logging @pnp/common
```

## Ví dụ: Sử dụng với SharePoint List

### Cấu hình cơ bản

```tsx
import React from 'react';
import { FormProvider, useForm, FormTextField, FormDropdown } from 'spfx-form-handler';
import { sp } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface MyFormProps {
  context: WebPartContext;
  itemId?: number; // 0 hoặc undefined = new, > 0 = edit
}

const MyForm: React.FC<MyFormProps> = ({ context, itemId = 0 }) => {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit}>
      <FormTextField name="Title" label="Title" required />
      <FormTextField name="Description" label="Description" multiline rows={4} />
      <FormDropdown
        name="Status"
        label="Status"
        options={[
          { key: 'Active', text: 'Active' },
          { key: 'Inactive', text: 'Inactive' },
        ]}
      />
      <button type="submit" disabled={form.isSubmitting}>
        {form.itemId ? 'Update' : 'Create'}
      </button>
    </form>
  );
};

const App: React.FC<MyFormProps> = ({ context, itemId = 0 }) => {
  // Initialize SPFx
  sp.setup({
    spfxContext: context,
  });

  // Create API service
  const apiService = {
    getItem: async (listName: string, itemId: number, listUrl?: string) => {
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const response = await web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .get();
      
      return { success: true, data: response };
    },

    addItem: async (listName: string, data: any, listUrl?: string) => {
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      const response = await web
        .lists.getByTitle(listName)
        .items.add(data);
      
      return { success: true, data: response.data };
    },

    updateItem: async (listName: string, itemId: number, data: any, listUrl?: string) => {
      const web = listUrl 
        ? sp.site.openWeb(listUrl)
        : sp.web;
      
      await web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .update(data);
      
      // Fetch updated item
      const updatedItem = await web
        .lists.getByTitle(listName)
        .items.getById(itemId)
        .get();
      
      return { success: true, data: updatedItem };
    },
  };

  return (
    <FormProvider
      config={{
        id: itemId, // 0 = new, > 0 = edit
        listName: 'Projects',
        listUrl: 'https://hieho.sharepoint.com/sites/apps',
        fieldMapping: {
          // Map SharePoint field names to form field names
          Title: 'Title',
          Description: 'Description',
          Status: 'Status',
          AssignedToId: 'AssignedTo',
        },
        apiService: apiService,
        autoSave: true, // Tự động save vào SharePoint khi submit
        validationSchema: {
          Title: {
            required: true,
            minLength: 3,
          },
        },
        onSaveSuccess: (data) => {
          console.log('Item saved:', data);
          // Có thể show notification hoặc redirect
        },
        onSaveError: (error) => {
          console.error('Save failed:', error);
          // Có thể show error message
        },
      }}
    >
      <MyForm context={context} itemId={itemId} />
    </FormProvider>
  );
};

export default App;
```

## Ví dụ: Với endpoint cụ thể

Nếu bạn có endpoint: `https://hieho.sharepoint.com/sites/apps` và list name: `Projects`

```tsx
<FormProvider
  config={{
    id: 1, // Item ID (0 = new, > 0 = edit)
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps',
    fieldMapping: {
      Title: 'Title',
      ProjectCode: 'projectCode',
      StartDate: 'startDate',
      EndDate: 'endDate',
      Status: 'status',
      AssignedToId: 'assignedTo',
      ProjectManagerId: 'projectManager',
    },
    apiService: {
      getItem: async (listName, itemId, listUrl) => {
        const web = sp.site.openWeb(listUrl);
        const item = await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .get();
        return { success: true, data: item };
      },
      addItem: async (listName, data, listUrl) => {
        const web = sp.site.openWeb(listUrl);
        const result = await web
          .lists.getByTitle(listName)
          .items.add(data);
        return { success: true, data: result.data };
      },
      updateItem: async (listName, itemId, data, listUrl) => {
        const web = sp.site.openWeb(listUrl);
        await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .update(data);
        const updated = await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .get();
        return { success: true, data: updated };
      },
    },
    autoSave: true,
    validationSchema: {
      Title: { required: true },
      ProjectCode: { required: true },
    },
  }}
>
  {/* Your form components */}
</FormProvider>
```

## Sử dụng với SharePoint REST API (không dùng @pnp/sp)

```tsx
import { createSpfxRestApiService } from 'spfx-form-handler';

const apiService = createSpfxRestApiService(context);

<FormProvider
  config={{
    id: 1,
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps',
    apiService: apiService,
    autoSave: true,
  }}
>
  {/* Your form */}
</FormProvider>
```

## Field Mapping

Field mapping giúp map giữa SharePoint field names và form field names:

```tsx
fieldMapping: {
  // SharePoint field → Form field
  'Project Title': 'title',
  'Project Code': 'code',
  'Start Date': 'startDate',
  'Assigned To': 'assignedTo', // User field
  'Project Status': 'status',
}
```

Khi load data: SharePoint fields → Form fields
Khi save: Form fields → SharePoint fields

## Xử lý User Fields

SharePoint User fields trả về object, nhưng form cần ID:

```tsx
// Khi load: Tự động convert User object → ID
// AssignedTo: { Id: 1, Title: 'John Doe' } → assignedTo: 1

// Khi save: Form value (ID) → SharePoint format
// assignedTo: 1 → AssignedToId: 1
```

## Xử lý Lookup Fields

```tsx
fieldMapping: {
  'Category': 'category', // Lookup field
  'Tags': 'tags', // Multi-lookup field
}

// Khi load: Lookup object → ID
// Category: { Id: 1, Title: 'Tech' } → category: 1

// Khi save: ID → SharePoint format
// category: 1 → CategoryId: 1
```

## Callbacks

```tsx
<FormProvider
  config={{
    // ... other config
    onItemLoaded: (itemData) => {
      // Called when item data is loaded
      console.log('Loaded:', itemData);
    },
    onLoadError: (error) => {
      // Called when loading fails
      console.error('Load error:', error);
    },
    onSaveSuccess: (data) => {
      // Called when save is successful
      console.log('Saved:', data);
      // Show success notification
    },
    onSaveError: (error) => {
      // Called when save fails
      console.error('Save error:', error);
      // Show error notification
    },
  }}
>
```

## Access Form Data

```tsx
const form = useForm();

// Get value
const title = form.getValue('Title');

// Set value
form.setValue('Title', 'New Title');

// Get all values
const allValues = form.values;

// Check if editing or creating
if (form.itemId) {
  // Editing item with ID = form.itemId
} else {
  // Creating new item
}
```

## Multiple Forms on Same Page

Mỗi `FormProvider` tạo một React Context riêng, nên bạn có thể dùng nhiều form trên cùng một page mà không bị conflict:

```tsx
// Form 1 - Projects
<FormProvider
  config={{
    id: 1,
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps',
    // ...
  }}
>
  <ProjectForm />
</FormProvider>

// Form 2 - Tasks (hoàn toàn độc lập)
<FormProvider
  config={{
    id: 2,
    listName: 'Tasks',
    listUrl: 'https://hieho.sharepoint.com/sites/apps',
    // ...
  }}
>
  <TaskForm />
</FormProvider>
```

Mỗi form sẽ có:
- State riêng (values, errors, touched)
- List configuration riêng (listName, listUrl, itemId)
- Validation schema riêng
- API service riêng

`useForm()` hook sẽ tự động lấy đúng context từ FormProvider gần nhất.

## Complete Example

```tsx
import React from 'react';
import { 
  FormProvider, 
  useForm, 
  FormTextField, 
  FormDropdown,
  FormDatePicker,
  FormUserPicker 
} from 'spfx-form-handler';
import { sp } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface ProjectFormProps {
  context: WebPartContext;
  itemId?: number;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ context, itemId = 0 }) => {
  // Initialize SPFx
  React.useEffect(() => {
    sp.setup({ spfxContext: context });
  }, [context]);

  const apiService = {
    getItem: async (listName: string, id: number, listUrl?: string) => {
      const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
      const item = await web.lists.getByTitle(listName).items.getById(id).get();
      return { success: true, data: item };
    },
    addItem: async (listName: string, data: any, listUrl?: string) => {
      const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
      const result = await web.lists.getByTitle(listName).items.add(data);
      return { success: true, data: result.data };
    },
    updateItem: async (listName: string, id: number, data: any, listUrl?: string) => {
      const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
      await web.lists.getByTitle(listName).items.getById(id).update(data);
      const updated = await web.lists.getByTitle(listName).items.getById(id).get();
      return { success: true, data: updated };
    },
  };

  return (
    <FormProvider
      config={{
        id: itemId,
        listName: 'Projects',
        listUrl: 'https://hieho.sharepoint.com/sites/apps',
        fieldMapping: {
          Title: 'Title',
          'Project Code': 'projectCode',
          'Start Date': 'startDate',
          'End Date': 'endDate',
          Status: 'status',
          'Assigned To': 'assignedTo',
        },
        apiService: apiService,
        autoSave: true,
        validationSchema: {
          Title: { required: true, minLength: 3 },
          projectCode: { required: true },
          startDate: { required: true },
          status: { required: true },
        },
        onSaveSuccess: (data) => {
          alert(`Project ${itemId ? 'updated' : 'created'} successfully!`);
        },
        onSaveError: (error) => {
          alert(`Error: ${error}`);
        },
      }}
    >
      <ProjectFormContent />
    </FormProvider>
  );
};

const ProjectFormContent: React.FC = () => {
  const form = useForm();

  if (form.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit}>
      <FormTextField name="Title" label="Project Title" required />
      <FormTextField name="projectCode" label="Project Code" required />
      <FormDatePicker name="startDate" label="Start Date" isRequired />
      <FormDatePicker name="endDate" label="End Date" />
      <FormDropdown
        name="status"
        label="Status"
        options={[
          { key: 'Active', text: 'Active' },
          { key: 'On Hold', text: 'On Hold' },
          { key: 'Completed', text: 'Completed' },
        ]}
        required
      />
      <FormUserPicker name="assignedTo" label="Assigned To" />
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.itemId ? 'Update Project' : 'Create Project'}
      </button>
    </form>
  );
};

export default ProjectForm;
```

