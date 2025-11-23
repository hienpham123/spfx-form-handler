# SPFx Form Handler

A powerful form handling library for SPFx and React applications with validation, state management, and mock API support. Works seamlessly with both Functional Components and Class Components.

## Features

- ✅ **Form State Management** - Centralized form state with React Context
- ✅ **Validation** - Built-in validation rules (required, email, min/max length, custom validators)
- ✅ **Fluent UI Integration** - Pre-built form components using Fluent UI
- ✅ **Mock API Support** - Test forms without a SharePoint tenant
- ✅ **TypeScript Support** - Full TypeScript support with type definitions
- ✅ **Class Component Support** - Works with both functional and class components
- ✅ **Easy SPFx Integration** - Easy to replace mock API with real SPFx API calls

## Installation

```bash
npm install spfx-form-handler
```

## Quick Start

### Method 1: Using FormField (Recommended for SharePoint)

**Easiest way** - Just pass SharePoint Internal Field Names. FormField automatically detects field types and renders the correct component.

```tsx
import React from 'react';
import {
  FormProvider,
  useForm,
  FormField,
} from 'spfx-form-handler';
import '@fluentui/react/dist/css/fabric.min.css';

const MyForm: React.FC = () => {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit}>
      {/* FormField automatically detects field type from SharePoint */}
      <FormField fieldName="Title" />
      <FormField fieldName="Category" />
      <FormField fieldName="Status" />
      <FormField fieldName="StartDate" />
      <FormField fieldName="AssignedTo" />
      
      <button type="submit">Submit</button>
    </form>
  );
};

const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        // Chỉ cần truyền endpoint và listName
        listName: 'Projects',
        listUrl: 'https://hieho.sharepoint.com/sites/apps', // Web URL hoặc List URL (sẽ tự động extract web URL)
        // userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Optional: Web URL riêng cho user search
        id: 0, // 0 = new, > 0 = edit
        autoSave: true, // Auto save to SharePoint
      }}
    >
      <MyForm />
    </FormProvider>
  );
};
```

### Method 2: Using Individual Components

For more control, use individual form components:

```tsx
import React from 'react';
import {
  FormProvider,
  useForm,
  FormTextField,
  FormDropdown,
  PrimaryButton,
} from 'spfx-form-handler';
import '@fluentui/react/dist/css/fabric.min.css';

const MyForm: React.FC = () => {
  const form = useForm();

  return (
    <form onSubmit={form.handleSubmit}>
      <FormTextField
        name="title"
        label="Title"
        required
      />
      
      <FormTextField
        name="email"
        label="Email"
        type="email"
        required
      />
      
      <FormDropdown
        name="status"
        label="Status"
        options={[
          { key: 'active', text: 'Active' },
          { key: 'inactive', text: 'Inactive' }
        ]}
        required
      />
      
      <PrimaryButton type="submit" text="Submit" />
    </form>
  );
};

const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        initialValues: {
          title: '',
          email: '',
          status: undefined,
        },
        validationSchema: {
          title: {
            required: true,
            minLength: 3,
          },
          email: {
            required: true,
            email: true,
          },
          status: {
            required: true,
          },
        },
        onSubmit: async (values) => {
          console.log('Form submitted:', values);
          // Your submission logic here
        },
      }}
    >
      <MyForm />
    </FormProvider>
  );
};
```

## Components

### FormTextField

Text input field with validation support.

```tsx
<FormTextField
  name="title"
  label="Title"
  placeholder="Enter title"
  required
  type="text" // or "email", "password", "number"
/>
```

### FormDropdown

Dropdown/select field with validation support.

```tsx
<FormDropdown
  name="status"
  label="Status"
  options={[
    { key: 'active', text: 'Active' },
    { key: 'inactive', text: 'Inactive' }
  ]}
  required
/>
```

### FormDatePicker

Date picker field with validation support.

```tsx
<FormDatePicker
  name="startDate"
  label="Start Date"
  placeholder="Select date"
  required
/>
```

### FormCheckbox

Checkbox field with validation support.

```tsx
<FormCheckbox
  name="agreeToTerms"
  label="I agree to the terms"
/>
```

### FormMultiChoice

Multi-choice field allowing multiple selections.

```tsx
<FormMultiChoice
  name="skills"
  label="Skills"
  options={[
    { key: 'react', text: 'React' },
    { key: 'typescript', text: 'TypeScript' }
  ]}
/>
```

### FormLookup

Lookup field for SharePoint Lookup columns. Supports both single and multi-select.

```tsx
// Single select lookup
<FormLookup
  name="category"
  label="Category"
  lookupList="Categories"
  required
/>

// Multi-select lookup
<FormLookup
  name="tags"
  label="Tags"
  lookupList="Tags"
  multiSelect
/>
```

### FormUserPicker

User/People picker field for SharePoint User columns. Supports both single and multi-select with search functionality. Automatically loads users from SharePoint when `listUrl` or `userServiceUrl` is provided.

```tsx
// Single select user picker
<FormUserPicker
  name="assignedTo"
  label="Assigned To"
  required
/>

// Multi-select user picker
<FormUserPicker
  name="teamMembers"
  label="Team Members"
  multiSelect
  allowGroups // Allow selecting groups in addition to users
/>
```

**Note:** `FormUserPicker` requires a web URL (not list URL) to search users. The library automatically extracts the web URL from `listUrl` if it's a list URL, or you can provide `userServiceUrl` explicitly:

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps/Lists/Projects', // List URL
    userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Web URL for user search (optional, auto-extracted from listUrl)
  }}
>
  <FormUserPicker name="assignedTo" />
</FormProvider>
```

### FormAttachmentPicker

Attachment field for SharePoint Attachment columns. Supports file upload, preview, and removal.

```tsx
<FormAttachmentPicker
  name="attachments"
  label="Attachments"
  maxSize={10 * 1024 * 1024} // 10MB
  allowedFileTypes={['pdf', 'docx', 'jpg', 'png']}
  maxFiles={5}
  required
/>
```

### FormCustomField

Render custom field using `onRenderField` from FormProvider config.

```tsx
<FormCustomField
  name="customField"
  fallback={<Text>Custom field not configured</Text>}
/>
```

## Validation Rules

### Available Rules

- `required` - Field is required
- `email` - Must be a valid email address
- `minLength` - Minimum string length
- `maxLength` - Maximum string length
- `min` - Minimum number value
- `max` - Maximum number value
- `pattern` - Regular expression pattern
- `custom` - Custom validation function

### Example

```tsx
validationSchema: {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  email: {
    required: true,
    email: true,
  },
  age: {
    required: true,
    min: 18,
    max: 100,
  },
  phone: {
    pattern: /^[0-9]{10}$/,
  },
  password: {
    required: true,
    custom: (value) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      return null;
    },
  },
}
```

## Mock API Service

The library includes a mock API service that simulates SharePoint API calls, allowing you to test forms without a tenant.

### Using Mock API

```tsx
import { mockApi } from 'spfx-form-handler';

// In your form submission
const handleSubmit = async (values: any) => {
  const response = await mockApi.post('/lists/items', values);
  
  if (response.success) {
    console.log('Success:', response.data);
  } else {
    console.error('Error:', response.error);
  }
};
```

### Mock API Methods

- `get(endpoint)` - Simulate GET request
- `post(endpoint, data)` - Simulate POST request
- `patch(endpoint, data)` - Simulate PATCH request
- `delete(endpoint)` - Simulate DELETE request

### Configuring Mock API

```tsx
import { mockApi } from 'spfx-form-handler';

// Configure delay and failure rate
mockApi.updateConfig({
  delay: 1000, // 1 second delay
  failRate: 0.1, // 10% failure rate
});
```

## Real SharePoint Usage

### Example: Using with SharePoint List

**Endpoint:** `https://hieho.sharepoint.com/sites/apps`  
**List Name:** `Projects`

```tsx
import { sp } from '@pnp/sp';
import { FormProvider, useForm } from 'spfx-form-handler';

// Initialize SPFx
sp.setup({
  spfxContext: context, // Your SPFx context
});

// Create API service
const apiService = {
  getItem: async (listName, itemId, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const item = await web.lists.getByTitle(listName).items.getById(itemId).get();
    return { success: true, data: item };
  },
  addItem: async (listName, data, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const result = await web.lists.getByTitle(listName).items.add(data);
    return { success: true, data: result.data };
  },
  updateItem: async (listName, itemId, data, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    await web.lists.getByTitle(listName).items.getById(itemId).update(data);
    const updated = await web.lists.getByTitle(listName).items.getById(itemId).get();
    return { success: true, data: updated };
  },
};

// Use in FormProvider
<FormProvider
  config={{
    id: 1, // 0 = new, > 0 = edit
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps',
    apiService: apiService,
    autoSave: true, // Auto save on submit
    fieldMapping: {
      Title: 'title',
      'Project Code': 'projectCode',
    },
  }}
>
  <MyForm />
</FormProvider>
```

See [SPFX_USAGE.md](./SPFX_USAGE.md) for complete examples.

## Replacing Mock API with Real SPFx API

When you have access to a SharePoint tenant, you can easily replace the mock API with real SPFx API calls.

### Example with @pnp/sp

```tsx
import { sp } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';

// Initialize SPFx
sp.setup({
  spfxContext: context,
});

// Create your API service
export const spfxApi = {
  get: async (endpoint: string) => {
    try {
      const response = await sp.web.get();
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  post: async (endpoint: string, data: any) => {
    try {
      const listName = endpoint.split('/')[2]; // Extract list name
      const response = await sp.web.lists.getByTitle(listName).items.add(data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  // ... other methods
};

// Use in your form
const handleSubmit = async (values: any) => {
  const response = await spfxApi.post('/lists/MyList', values);
  // Handle response
};
```

## Hooks

### useForm

Access form state and methods.

```tsx
const form = useForm();

// Available properties and methods:
// - values: FormState
// - errors: FormErrors
// - touched: FormTouched
// - isSubmitting: boolean
// - isValid: boolean
// - setValue(name, value)
// - handleChange(name, value)
// - handleBlur(name)
// - handleSubmit(e)
// - reset()
// - validate()
```

### useField

Access a specific field's state and handlers.

```tsx
const { value, error, touched, onChange, onBlur } = useField('email');
```

## Class Component Support

The library provides two ways to use form context in class components:

### Method 1: Using withForm HOC (Recommended)

Wrap your class component with `withForm` HOC to inject form context as props.

```tsx
import React from 'react';
import { 
  FormProvider, 
  withForm, 
  WithFormProps,
  FormTextField,
  FormDropdown,
  PrimaryButton 
} from 'spfx-form-handler';

interface MyFormProps extends WithFormProps {
  title?: string;
}

class MyFormComponent extends React.Component<MyFormProps> {
  render() {
    const { form, title = 'My Form' } = this.props;
    
    return (
      <form onSubmit={form.handleSubmit}>
        <h2>{title}</h2>
        
        <FormTextField
          name="title"
          label="Title"
          required
        />
        
        <FormTextField
          name="email"
          label="Email"
          type="email"
          required
        />
        
        <FormDropdown
          name="status"
          label="Status"
          options={[
            { key: 'active', text: 'Active' },
            { key: 'inactive', text: 'Inactive' }
          ]}
          required
        />
        
        <PrimaryButton
          type="submit"
          text="Submit"
          disabled={form.isSubmitting || !form.isValid}
        />
        
        <button type="button" onClick={() => form.reset()}>
          Reset
        </button>
      </form>
    );
  }
}

// Wrap component with withForm HOC
const MyForm = withForm(MyFormComponent);

// Use in your app
const App = () => {
  return (
    <FormProvider
      config={{
        initialValues: {
          title: '',
          email: '',
          status: undefined,
        },
        validationSchema: {
          title: { required: true, minLength: 3 },
          email: { required: true, email: true },
          status: { required: true },
        },
        onSubmit: async (values) => {
          console.log('Submitted:', values);
        },
      }}
    >
      <MyForm title="User Registration" />
    </FormProvider>
  );
};
```

### Method 2: Using FormConsumer (Render Props Pattern)

Use `FormConsumer` component for render props pattern.

```tsx
import React from 'react';
import { 
  FormProvider, 
  FormConsumer,
  FormTextField,
  PrimaryButton 
} from 'spfx-form-handler';

class MyFormComponent extends React.Component {
  render() {
    return (
      <FormConsumer>
        {(form) => (
          <form onSubmit={form.handleSubmit}>
            <FormTextField
              name="name"
              label="Name"
              required
            />
            
            <PrimaryButton
              type="submit"
              text="Submit"
              disabled={form.isSubmitting}
            />
            
            <div>
              <p>Is Valid: {form.isValid ? 'Yes' : 'No'}</p>
              <p>Is Submitting: {form.isSubmitting ? 'Yes' : 'No'}</p>
            </div>
          </form>
        )}
      </FormConsumer>
    );
  }
}

const App = () => {
  return (
    <FormProvider
      config={{
        initialValues: { name: '' },
        validationSchema: {
          name: { required: true },
        },
        onSubmit: async (values) => {
          console.log('Submitted:', values);
        },
      }}
    >
      <MyFormComponent />
    </FormProvider>
  );
};
```

### Using with SharePoint List (FormField)

You can use `withForm` HOC with SharePoint lists and `FormField` component:

```tsx
import React from 'react';
import { 
  FormProvider, 
  withForm, 
  WithFormProps,
  FormField,
  PrimaryButton 
} from 'spfx-form-handler';

interface ProjectFormProps extends WithFormProps {
  projectId?: number;
}

class ProjectFormComponent extends React.Component<ProjectFormProps> {
  componentDidMount() {
    const { form, projectId } = this.props;
    
    // Reload data if projectId is provided
    if (projectId && projectId > 0) {
      form.reloadItemData();
    }
  }

  componentDidUpdate(prevProps: ProjectFormProps) {
    const { form, projectId } = this.props;
    
    // Reload when projectId changes
    if (projectId !== prevProps.projectId && projectId && projectId > 0) {
      form.reloadItemData();
    }
  }

  render() {
    const { form, projectId } = this.props;

    if (form.isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <form onSubmit={form.handleSubmit}>
        {/* FormField automatically detects field type */}
        <FormField fieldName="Title" />
        <FormField fieldName="StartDate" />
        <FormField fieldName="Status" />
        <FormField fieldName="AssignedTo" />
        
        <PrimaryButton
          type="submit"
          text={projectId ? "Update" : "Create"}
          disabled={form.isSubmitting || !form.isValid}
        />
        
        {projectId && (
          <button 
            type="button" 
            onClick={() => form.reloadItemData()}
          >
            Reload Data
          </button>
        )}
      </form>
    );
  }
}

const ProjectForm = withForm(ProjectFormComponent);

const App = () => {
  return (
    <FormProvider
      config={{
        id: 1, // 0 = new, > 0 = edit
        listName: 'Projects',
        listUrl: 'https://hieho.sharepoint.com/sites/apps',
        autoSave: true,
        onBeforeSave: (values) => {
          // Transform data before saving
          return {
            ...values,
            StartDate: values.StartDate ? new Date(values.StartDate).toISOString() : null,
          };
        },
        onValidSave: (form) => {
          // Custom validation
          if (!form.isValid) return false;
          // Add your business rules here
          return true;
        },
      }}
    >
      <ProjectForm projectId={1} />
    </FormProvider>
  );
};
```

### Available Form Methods in Class Components

When using `withForm` HOC or `FormConsumer`, you have access to all form methods:

```tsx
const { form } = this.props; // or from FormConsumer

// Form state
form.values          // Current form values
form.errors          // Form errors
form.touched         // Touched fields
form.isValid         // Is form valid
form.isSubmitting    // Is form submitting
form.isLoading       // Is loading data
form.itemData        // Loaded item data
form.itemId          // Current item ID
form.listName        // SharePoint list name
form.listUrl         // SharePoint list URL
form.userServiceUrl  // SharePoint web URL for user search

// Form methods
form.setValue(name, value)        // Set field value
form.getValue(name)               // Get field value
form.setError(name, error)        // Set field error
form.handleChange(name, value)    // Handle field change
form.handleBlur(name)              // Handle field blur
form.handleSubmit(e)              // Handle form submit
form.reset()                       // Reset form
form.resetField(name)              // Reset specific field
form.validate()                    // Validate form
form.validateField(name)           // Validate specific field
form.reloadItemData()              // Reload item data from SharePoint
```

See `demo/ClassComponentExample.tsx` for complete examples.

## FormProvider Configuration

### Basic Configuration

```tsx
<FormProvider
  config={{
    initialValues: {
      // Initial form values
    },
    validationSchema: {
      // Validation rules
    },
    onSubmit: async (values) => {
      // Submission handler
    },
    onError: (errors) => {
      // Error handler
    },
    validateOnChange: true, // Default: true
    validateOnBlur: true, // Default: true
    enableReinitialize: false, // Default: false
  }}
>
  {/* Your form components */}
</FormProvider>
```

### With SharePoint List Configuration (Simple - Recommended)

**Chỉ cần truyền endpoint và listName**, FormField sẽ tự động detect field types:

```tsx
import { sp } from '@pnp/sp';
import { FormProvider, FormField } from 'spfx-form-handler';

// Initialize SPFx
sp.setup({
  spfxContext: context, // Your SPFx context
});

// Create API service
const apiService = {
  getItem: async (listName, itemId, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const item = await web.lists.getByTitle(listName).items.getById(itemId).get();
    return { success: true, data: item };
  },
  addItem: async (listName, data, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const result = await web.lists.getByTitle(listName).items.add(data);
    return { success: true, data: result.data };
  },
  updateItem: async (listName, itemId, data, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    await web.lists.getByTitle(listName).items.getById(itemId).update(data);
    const updated = await web.lists.getByTitle(listName).items.getById(itemId).get();
    return { success: true, data: updated };
  },
  getFieldMetadata: async (listName, fieldName, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const field = await web
      .lists.getByTitle(listName)
      .fields
      .getByInternalNameOrTitle(fieldName)
      .get();
    return { success: true, data: field };
  },
  getListItems: async (listName, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const items = await web.lists.getByTitle(listName).items.select('Id', 'Title').get();
    return { success: true, data: items };
  },
  uploadFile: async (listName, itemId, file, fileName, listUrl) => {
    const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
    const attachmentFolder = web
      .lists.getByTitle(listName)
      .items.getById(itemId)
      .attachmentFiles;
    const arrayBuffer = await file.arrayBuffer();
    const result = await attachmentFolder.add(fileName || file.name, arrayBuffer);
    return { success: true, data: result.data };
  },
};

<FormProvider
  config={{
    id: 1, // 0 = new, > 0 = edit
    listName: 'Projects', // ✅ SharePoint list name
    listUrl: 'https://hieho.sharepoint.com/sites/apps', // ✅ Web URL hoặc List URL
    // userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Optional: Web URL riêng cho user search (auto-extracted từ listUrl nếu không có)
    apiService: apiService,
    autoSave: true, // Auto save to SharePoint
  }}
>
  {/* Chỉ cần truyền Internal Field Name từ SharePoint */}
  <FormField fieldName="Title" />
  <FormField fieldName="Category" />
  <FormField fieldName="Status" />
  <FormField fieldName="StartDate" />
  <FormField fieldName="AssignedTo" /> {/* FormUserPicker sẽ tự động lấy users từ SharePoint */}
</FormProvider>
```

### Advanced Configuration with Field Mapping

For more control, use individual components with field mapping:

```tsx
<FormProvider
  config={{
    id: 1,
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps',
    fieldMapping: {
      // Map SharePoint field names to form field names
      'SPFieldName': 'formFieldName',
      'AssignedToId': 'assignedTo',
    },
    apiService: apiService,
    autoSave: true,
  }}
>
  <FormTextField name="title" />
  <FormLookup name="category" lookupList="Categories" />
</FormProvider>
```

### Accessing Item Data

Use `useForm` hook to access the loaded item data:

```tsx
const form = useForm();

// Access original item data
console.log(form.itemData);

// Check loading state
if (form.isLoading) {
  return <Spinner />;
}

// Reload item data
form.reloadItemData();
```

### Custom Data Transformation Before Save

Use `onBeforeSave` to transform data before saving:

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps', // Web URL hoặc List URL
    // userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Optional: Web URL riêng cho user search
    onBeforeSave: (values) => {
      // Transform data before saving
      return {
        ...values,
        // Add computed fields
        FullName: `${values.FirstName} ${values.LastName}`,
        // Format dates
        StartDate: values.StartDate ? new Date(values.StartDate).toISOString() : null,
        // Transform nested objects
        Metadata: JSON.stringify(values.CustomData),
      };
    },
  }}
>
  {/* Your form */}
</FormProvider>
```

### Custom Validation Before Save

Use `onValidSave` to add custom validation logic before saving:

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps', // Web URL hoặc List URL
    // userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Optional: Web URL riêng cho user search
    onValidSave: (form) => {
      // Custom validation logic
      // Return true to allow save, false to prevent save
      
      // Example: Only allow save if form is valid AND status is not "Draft"
      if (!form.isValid) {
        return false;
      }
      
      // Example: Check business rules
      if (form.values.Status === 'Draft' && !form.values.Description) {
        form.setError('Description', { message: 'Description is required for draft items', type: 'required' });
        return false;
      }
      
      // Example: Check date ranges
      if (form.values.StartDate && form.values.EndDate) {
        const start = new Date(form.values.StartDate);
        const end = new Date(form.values.EndDate);
        if (start > end) {
          form.setError('EndDate', { message: 'End date must be after start date', type: 'custom' });
          return false;
        }
      }
      
      return true; // Allow save
    },
  }}
>
  {/* Your form */}
</FormProvider>
```

## User Service URL Configuration

When using `FormUserPicker`, the library needs a web URL (not list URL) to search for users. The library automatically extracts the web URL from `listUrl` if it's a list URL, or you can provide `userServiceUrl` explicitly:

### Automatic Extraction

If `listUrl` is a list URL (contains `/Lists/`), the library automatically extracts the web URL:

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps/Lists/Projects', // List URL
    // userServiceUrl will be automatically extracted to: https://hieho.sharepoint.com/sites/apps
  }}
>
  <FormUserPicker name="assignedTo" /> {/* Uses extracted web URL */}
</FormProvider>
```

### Explicit userServiceUrl

You can also provide `userServiceUrl` explicitly:

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'https://hieho.sharepoint.com/sites/apps/Lists/Projects', // List URL for list operations
    userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Web URL for user search
  }}
>
  <FormUserPicker name="assignedTo" /> {/* Uses userServiceUrl */}
</FormProvider>
```

**Note:** 
- `listUrl` is used for list operations (getItem, addItem, updateItem, etc.)
- `userServiceUrl` is used for user search operations (FormUserPicker)
- If `userServiceUrl` is not provided, it's automatically extracted from `listUrl`

## Multiple Forms

Each `FormProvider` creates its own isolated React Context, so you can use multiple forms on the same page without conflicts:

```tsx
// Form 1
<FormProvider config={{ id: 1, listName: 'Projects', ... }}>
  <Form1 />
</FormProvider>

// Form 2 - Completely independent
<FormProvider config={{ id: 2, listName: 'Tasks', ... }}>
  <Form2 />
</FormProvider>
```

Each form maintains its own:
- State (values, errors, touched)
- List configuration (listName, listUrl, itemId)
- Validation schema
- API service

See `demo/MultipleFormsExample.tsx` for a complete example.

## Development

### Running the Demo

```bash
npm install
npm run dev
```

### Building

```bash
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

