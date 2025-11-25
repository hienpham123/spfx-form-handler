# SPFx Form Handler

A powerful form handling library for SPFx and React applications with validation, state management, and SharePoint integration. Works seamlessly with both Functional Components and Class Components.

## Features

- ✅ **Form State Management** - Centralized form state with React Context
- ✅ **Validation** - Built-in validation rules (required, email, min/max length, custom validators)
- ✅ **Fluent UI Integration** - Pre-built form components using Fluent UI
- ✅ **SharePoint Integration** - Automatic API service creation from `listUrl`
- ✅ **Dirty Fields Tracking** - Only update changed fields when editing items
- ✅ **TypeScript Support** - Full TypeScript support with type definitions
- ✅ **Class Component Support** - Works with both functional and class components
- ✅ **Auto Field Detection** - Automatically detects SharePoint field types and renders correct components
- ✅ **Attachment Handling** - Upload, delete, and preview attachments
- ✅ **User & Lookup Fields** - Automatic single/multi-select detection

## Installation

```bash
npm install spfx-form-handler
```

## Quick Start

### Function Component Example

#### Method 1: Using FormField (Recommended for SharePoint)

**Easiest way** - Just pass SharePoint Internal Field Names. FormField automatically detects field types and renders the correct component.

```tsx
import React from 'react';
import {
  FormProvider,
  useForm,
  FormField,
  registerSharePointWeb,
} from 'spfx-form-handler';
import { Web } from '@pnp/sp';
import { PrimaryButton, Stack } from '@fluentui/react';
import '@fluentui/react/dist/css/fabric.min.css';

// Register Web class for automatic API service creation
registerSharePointWeb(Web);

const MyForm: React.FC = () => {
  const form = useForm();

  if (form.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit}>
      <Stack tokens={{ childrenGap: 16 }}>
        {/* FormField automatically detects field type from SharePoint */}
        <FormField fieldName="Title" />
        <FormField fieldName="ItemType" />
        <FormField fieldName="StartDate" />
        <FormField fieldName="Owner" />
        <FormField fieldName="Link" />
        <FormField fieldName="Attachments" />
        
        <PrimaryButton
          type="submit"
          text={form.itemId ? "Update" : "Create"}
          disabled={form.isSubmitting}
        />
        
        {/* Display dirty fields */}
        {Object.keys(form.dirtyFields).length > 0 && (
          <div>
            <strong>Changed fields:</strong> {Object.keys(form.dirtyFields).join(', ')}
          </div>
        )}
      </Stack>
    </form>
  );
};

const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        id: 0, // 0 = new, > 0 = edit existing
        listName: 'DemoList',
        listUrl: 'http://localhost:8080/sites/Developer', // Web URL or List URL
        autoSave: true,
        validationSchema: {
          Title: { required: true, minLength: 3 },
          ItemType: { required: true },
          StartDate: { required: true },
          Owner: { required: true },
        },
        onSaveSuccess: (data) => {
          alert(`Item ${data.Id ? 'updated' : 'created'} successfully!`);
        },
        onSaveError: (error) => {
          alert(`Error: ${error}`);
        },
      }}
    >
      <MyForm />
    </FormProvider>
  );
};
```

#### Method 2: Using Individual Components

For more control, use individual form components:

```tsx
import React from 'react';
import {
  FormProvider,
  useForm,
  FormTextField,
  FormDropdown,
  FormDatePicker,
  FormUserPicker,
  FormLookup,
  FormAttachmentPicker,
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
      
      <FormDropdown
        name="status"
        label="Status"
        options={[
          { key: 'active', text: 'Active' },
          { key: 'inactive', text: 'Inactive' }
        ]}
        required
      />
      
      <FormDatePicker
        name="startDate"
        label="Start Date"
        required
      />
      
      <FormUserPicker
        name="assignedTo"
        label="Assigned To"
        required
      />
      
      <FormLookup
        name="category"
        label="Category"
        lookupList="Categories"
        required
      />
      
      <FormAttachmentPicker
        name="attachments"
        label="Attachments"
        maxSize={10 * 1024 * 1024}
        allowedFileTypes={['pdf', 'docx', 'jpg']}
      />
      
      <PrimaryButton
        type="submit"
        text="Submit"
        disabled={form.isSubmitting || !form.isValid}
      />
      
      {/* Access dirty fields */}
      {Object.keys(form.dirtyFields).length > 0 && (
        <div>
          Changed: {Object.keys(form.dirtyFields).join(', ')}
        </div>
      )}
    </form>
  );
};

const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        initialValues: {
          title: '',
          status: undefined,
          startDate: null,
          assignedTo: null,
          category: null,
          attachments: [],
        },
        validationSchema: {
          title: { required: true, minLength: 3 },
          status: { required: true },
          startDate: { required: true },
          assignedTo: { required: true },
          category: { required: true },
        },
        onSubmit: async (values) => {
          console.log('Form submitted:', values);
        },
      }}
    >
      <MyForm />
    </FormProvider>
  );
};
```

### Class Component Example

#### Method 1: Using withForm HOC (Recommended)

Wrap your class component with `withForm` HOC to inject form context as props.

```tsx
import React from 'react';
import { 
  FormProvider, 
  withForm, 
  WithFormProps,
  FormField,
  PrimaryButton,
  registerSharePointWeb,
} from 'spfx-form-handler';
import { Web } from '@pnp/sp';
import { Stack, MessageBar, MessageBarType } from '@fluentui/react';
import '@fluentui/react/dist/css/fabric.min.css';

registerSharePointWeb(Web);

interface ProjectFormProps extends WithFormProps {
  projectId?: number;
}

class ProjectFormComponent extends React.Component<ProjectFormProps> {
  componentDidMount() {
    const { form, projectId } = this.props;
    
    if (projectId && projectId > 0) {
      form.reloadItemData();
    }
  }

  componentDidUpdate(prevProps: ProjectFormProps) {
    const { form, projectId } = this.props;
    
    if (projectId !== prevProps.projectId && projectId && projectId > 0) {
      form.reloadItemData();
    }
  }

  render() {
    const { form, projectId } = this.props;

    if (form.isLoading) {
      return <div>Loading project data...</div>;
    }

    const dirtyFieldNames = Object.keys(form.dirtyFields).filter(key => form.dirtyFields[key]);

    return (
      <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
        <h1>Project Form - Class Component</h1>
        
        {dirtyFieldNames.length > 0 && (
          <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: 16 }}>
            Changed fields: {dirtyFieldNames.join(', ')}
          </MessageBar>
        )}

        <form onSubmit={form.handleSubmit}>
          <Stack tokens={{ childrenGap: 16 }}>
            <FormField fieldName="Title" />
            <FormField fieldName="ItemType" />
            <FormField fieldName="StartDate" />
            <FormField fieldName="Owner" />
            <FormField fieldName="Link" />
            <FormField fieldName="Attachments" />
            
            <PrimaryButton
              type="submit"
              text={projectId ? "Update Project" : "Create Project"}
              disabled={form.isSubmitting || !form.isValid}
            />
            
            <button 
              type="button" 
              onClick={() => form.reset()}
              disabled={form.isSubmitting}
            >
              Reset
            </button>
            
            {projectId && (
              <button 
                type="button" 
                onClick={() => form.reloadItemData()}
                disabled={form.isSubmitting || form.isLoading}
              >
                Reload Data
              </button>
            )}
          </Stack>
        </form>
      </div>
    );
  }
}

// Wrap component with withForm HOC
const ProjectForm = withForm(ProjectFormComponent);

// Use in your app
const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        id: 1, // 0 = new, > 0 = edit
        listName: 'DemoList',
        listUrl: 'http://localhost:8080/sites/Developer',
        autoSave: true,
        validationSchema: {
          Title: { required: true, minLength: 3 },
          ItemType: { required: true },
          StartDate: { required: true },
          Owner: { required: true },
        },
        onSaveSuccess: (data) => {
          alert(`Project ${data.Id ? 'updated' : 'created'} successfully!`);
        },
        onSaveError: (error) => {
          alert(`Error: ${error}`);
        },
      }}
    >
      <ProjectForm projectId={1} />
    </FormProvider>
  );
};
```

#### Method 2: Using Individual Components in Class Component

```tsx
import React from 'react';
import { 
  FormProvider, 
  withForm, 
  WithFormProps,
  FormTextField,
  FormDropdown,
  FormDatePicker,
  FormUserPicker,
  FormLookup,
  PrimaryButton,
} from 'spfx-form-handler';
import { Stack } from '@fluentui/react';
import '@fluentui/react/dist/css/fabric.min.css';

interface MyFormProps extends WithFormProps {
  title?: string;
}

class MyFormComponent extends React.Component<MyFormProps> {
  render() {
    const { form, title = 'My Form' } = this.props;
    
    return (
      <form onSubmit={form.handleSubmit}>
        <h2>{title}</h2>
        
        <Stack tokens={{ childrenGap: 16 }}>
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
          
          <FormDatePicker
            name="startDate"
            label="Start Date"
            required
          />
          
          <FormUserPicker
            name="assignedTo"
            label="Assigned To"
            required
          />
          
          <FormLookup
            name="category"
            label="Category"
            lookupList="Categories"
            required
          />
          
          <PrimaryButton
            type="submit"
            text="Submit"
            disabled={form.isSubmitting || !form.isValid}
          />
          
          <button 
            type="button" 
            onClick={() => form.reset()}
          >
            Reset
          </button>
          
          {/* Display dirty fields */}
          {Object.keys(form.dirtyFields).length > 0 && (
            <div>
              <strong>Changed fields:</strong> {Object.keys(form.dirtyFields).join(', ')}
            </div>
          )}
        </Stack>
      </form>
    );
  }
}

const MyForm = withForm(MyFormComponent);

const App: React.FC = () => {
  return (
    <FormProvider
      config={{
        initialValues: {
          title: '',
          email: '',
          status: undefined,
          startDate: null,
          assignedTo: null,
          category: null,
        },
        validationSchema: {
          title: { required: true, minLength: 3 },
          email: { required: true, email: true },
          status: { required: true },
          startDate: { required: true },
          assignedTo: { required: true },
          category: { required: true },
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

## Dirty Fields Tracking

The library automatically tracks which fields have been changed. When updating an existing item, only the changed fields are sent to SharePoint, improving performance and reducing conflicts.

### Accessing Dirty Fields

```tsx
// Function Component
const form = useForm();
const dirtyFieldNames = Object.keys(form.dirtyFields).filter(key => form.dirtyFields[key]);
console.log('Changed fields:', dirtyFieldNames);

// Class Component
const { form } = this.props;
const dirtyFieldNames = Object.keys(form.dirtyFields).filter(key => form.dirtyFields[key]);
console.log('Changed fields:', dirtyFieldNames);
```

### How It Works

- **New Items (id = 0)**: All fields are sent when creating a new item
- **Existing Items (id > 0)**: Only fields that have been modified are sent when updating
- **Automatic Tracking**: Fields are automatically marked as dirty when their values change
- **Reset on Save**: Dirty fields are reset after a successful save

### Example

```tsx
const form = useForm();

// User changes Title and StartDate
// form.dirtyFields = { Title: true, StartDate: true }

// On submit, only Title and StartDate are sent to SharePoint
form.handleSubmit();

// After successful save, dirtyFields is reset to {}
```

## Components

### FormField

Automatically detects SharePoint field type and renders the correct component. **Recommended for SharePoint forms.**

```tsx
<FormField fieldName="Title" />
<FormField fieldName="StartDate" />
<FormField fieldName="Owner" />
<FormField fieldName="Link" />
<FormField fieldName="Attachments" />
```

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

Dropdown/select field with validation support. Uses `react-selectify` for better UI.

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

Lookup field for SharePoint Lookup columns. Supports both single and multi-select. Automatically detects single/multi-select from SharePoint field metadata. Uses `react-selectify` with checkboxes for multi-select.

```tsx
// Single select lookup (auto-detected)
<FormLookup
  name="category"
  label="Category"
  lookupList="Categories"
  required
/>

// Multi-select lookup (auto-detected)
<FormLookup
  name="tags"
  label="Tags"
  lookupList="Tags"
/>
```

### FormUserPicker

User/People picker field for SharePoint User columns. Supports both single and multi-select with search functionality. Automatically detects single/multi-select from SharePoint field metadata. Automatically loads users from SharePoint when `listUrl` or `userServiceUrl` is provided.

```tsx
// Single select user picker (auto-detected)
<FormUserPicker
  name="assignedTo"
  label="Assigned To"
  required
/>

// Multi-select user picker (auto-detected)
<FormUserPicker
  name="teamMembers"
  label="Team Members"
  allowGroups // Allow selecting groups in addition to users
/>
```

**Note:** `FormUserPicker` requires a web URL (not list URL) to search users. The library automatically extracts the web URL from `listUrl` if it's a list URL, or you can provide `userServiceUrl` explicitly.

### FormAttachmentPicker

Attachment field for SharePoint Attachment columns. Supports file upload, preview, and removal. Click on file names to open them in a new tab.

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

## SharePoint Integration

### Automatic API Service Creation

The library can automatically create a SharePoint API service from `listUrl`. Just register the `Web` class from `@pnp/sp`:

```tsx
import { Web } from '@pnp/sp';
import { registerSharePointWeb } from 'spfx-form-handler';

// Register Web class
registerSharePointWeb(Web);

// Now FormProvider will automatically create API service from listUrl
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'http://localhost:8080/sites/Developer', // Web URL or List URL
    autoSave: true,
  }}
>
  <MyForm />
</FormProvider>
```

### Local Development with sp-rest-proxy

For local development, use `sp-rest-proxy` on `localhost:8080`:

```tsx
<FormProvider
  config={{
    listName: 'DemoList',
    listUrl: 'http://localhost:8080/sites/Developer', // sp-rest-proxy URL
    autoSave: true,
  }}
>
  <MyForm />
</FormProvider>
```

### Manual API Service

You can also provide a custom API service:

```tsx
import { sp } from '@pnp/sp';

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
  // ... other methods
};

<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'https://tenant.sharepoint.com/sites/apps',
    apiService: apiService,
    autoSave: true,
  }}
>
  <MyForm />
</FormProvider>
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
// - dirtyFields: FormDirtyFields (new!)
// - isSubmitting: boolean
// - isLoading: boolean
// - isValid: boolean
// - itemData: any
// - itemId: number | undefined
// - listName: string | undefined
// - listUrl: string | undefined
// - setValue(name, value)
// - getValue(name)
// - handleChange(name, value)
// - handleBlur(name)
// - handleSubmit(e)
// - reset()
// - resetField(name)
// - validate()
// - validateField(name)
// - reloadItemData()
```

### useField

Access a specific field's state and handlers.

```tsx
const { value, error, touched, onChange, onBlur } = useField('email');
```

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

### SharePoint List Configuration

```tsx
<FormProvider
  config={{
    id: 0, // 0 = new, > 0 = edit existing
    listName: 'DemoList',
    listUrl: 'http://localhost:8080/sites/Developer', // Web URL or List URL
    autoSave: true,
    validationSchema: {
      Title: { required: true, minLength: 3 },
      ItemType: { required: true },
      StartDate: { required: true },
      Owner: { required: true },
    },
    onBeforeSave: (values) => {
      // Transform data before saving
      return {
        ...values,
        // Add computed fields, format dates, etc.
      };
    },
    onValidSave: (form) => {
      // Custom validation before save
      // Return true to allow save, false to prevent save
      return form.isValid;
    },
    onSaveSuccess: (data) => {
      alert(`Item ${data.Id ? 'updated' : 'created'} successfully!`);
    },
    onSaveError: (error) => {
      alert(`Error: ${error}`);
    },
  }}
>
  <MyForm />
</FormProvider>
```

### Custom Data Transformation Before Save

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'http://localhost:8080/sites/Developer',
    onBeforeSave: (values) => {
      return {
        ...values,
        FullName: `${values.FirstName} ${values.LastName}`,
        StartDate: values.StartDate ? new Date(values.StartDate).toISOString() : null,
      };
    },
  }}
>
  {/* Your form */}
</FormProvider>
```

### Custom Validation Before Save

```tsx
<FormProvider
  config={{
    listName: 'Projects',
    listUrl: 'http://localhost:8080/sites/Developer',
    onValidSave: (form) => {
      if (!form.isValid) {
        return false;
      }
      
      // Check business rules
      if (form.values.Status === 'Draft' && !form.values.Description) {
        form.setError('Description', { message: 'Description is required for draft items', type: 'required' });
        return false;
      }
      
      return true;
    },
  }}
>
  {/* Your form */}
</FormProvider>
```

## Class Component Support

The library provides `withForm` HOC to use form context in class components.

### Available Form Methods in Class Components

When using `withForm` HOC, you have access to all form methods:

```tsx
const { form } = this.props;

// Form state
form.values          // Current form values
form.errors          // Form errors
form.touched         // Touched fields
form.dirtyFields     // Dirty fields (changed fields)
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
form.handleBlur(name)             // Handle field blur
form.handleSubmit(e)              // Handle form submit
form.reset()                      // Reset form
form.resetField(name)             // Reset specific field
form.validate()                   // Validate form
form.validateField(name)          // Validate specific field
form.reloadItemData()             // Reload item data from SharePoint
```

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
- State (values, errors, touched, dirtyFields)
- List configuration (listName, listUrl, itemId)
- Validation schema
- API service

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
