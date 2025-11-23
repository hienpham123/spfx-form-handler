# Quick Start Guide

## Installation

```bash
npm install spfx-form-handler
```

## Basic Example

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
      
      <PrimaryButton 
        type="submit" 
        text="Submit"
        disabled={form.isSubmitting}
      />
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
          title: { required: true, minLength: 3 },
          email: { required: true, email: true },
          status: { required: true },
        },
        onSubmit: async (values) => {
          console.log('Submitted:', values);
        },
      }}
    >
      <MyForm />
    </FormProvider>
  );
};
```

## Using Mock API

```tsx
import { mockApi } from 'spfx-form-handler';

const handleSubmit = async (values: any) => {
  const response = await mockApi.post('/lists/items', values);
  
  if (response.success) {
    console.log('Success:', response.data);
  } else {
    console.error('Error:', response.error);
  }
};
```

## Replacing with Real SPFx API

```tsx
import { sp } from '@pnp/sp';

const spfxApi = {
  post: async (endpoint: string, data: any) => {
    const response = await sp.web.lists.getByTitle('MyList').items.add(data);
    return { success: true, data: response.data };
  },
};

// Use in form submission
const handleSubmit = async (values: any) => {
  const response = await spfxApi.post('/lists/MyList', values);
  // Handle response
};
```

