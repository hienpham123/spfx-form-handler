import React, { useState } from 'react';
import {
  FormProvider,
  useForm,
  FormTextField,
  FormDropdown,
} from '../src';
import { PrimaryButton, Stack, MessageBar, MessageBarType } from '@fluentui/react';

/**
 * Example: Multiple Forms - Each form has its own context
 * This demonstrates that each FormProvider creates its own isolated context
 */
const Form1: React.FC = () => {
  const form = useForm();

  return (
    <div style={{ padding: 16, border: '2px solid #0078d4', borderRadius: 4, marginBottom: 16 }}>
      <h3>Form 1 - Projects List</h3>
      <p>
        <strong>List:</strong> Projects | <strong>ID:</strong> {form.itemId || 'New'} | 
        <strong> Title Value:</strong> {form.getValue('Title') || '(empty)'}
      </p>
      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 12 }}>
          <FormTextField name="Title" label="Project Title" required />
          <FormDropdown
            name="Status"
            label="Status"
            options={[
              { key: 'Active', text: 'Active' },
              { key: 'Inactive', text: 'Inactive' },
            ]}
          />
          <PrimaryButton type="submit" text="Save Form 1" disabled={form.isSubmitting} />
        </Stack>
      </form>
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Form 1 Values: {JSON.stringify(form.values)}
      </div>
    </div>
  );
};

const Form2: React.FC = () => {
  const form = useForm();

  return (
    <div style={{ padding: 16, border: '2px solid #107c10', borderRadius: 4, marginBottom: 16 }}>
      <h3>Form 2 - Tasks List</h3>
      <p>
        <strong>List:</strong> Tasks | <strong>ID:</strong> {form.itemId || 'New'} | 
        <strong> Title Value:</strong> {form.getValue('Title') || '(empty)'}
      </p>
      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 12 }}>
          <FormTextField name="Title" label="Task Title" required />
          <FormDropdown
            name="Priority"
            label="Priority"
            options={[
              { key: 'High', text: 'High' },
              { key: 'Medium', text: 'Medium' },
              { key: 'Low', text: 'Low' },
            ]}
          />
          <PrimaryButton type="submit" text="Save Form 2" disabled={form.isSubmitting} />
        </Stack>
      </form>
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Form 2 Values: {JSON.stringify(form.values)}
      </div>
    </div>
  );
};

const Form3: React.FC = () => {
  const form = useForm();

  return (
    <div style={{ padding: 16, border: '2px solid #d13438', borderRadius: 4 }}>
      <h3>Form 3 - Documents List</h3>
      <p>
        <strong>List:</strong> Documents | <strong>ID:</strong> {form.itemId || 'New'} | 
        <strong> Title Value:</strong> {form.getValue('Title') || '(empty)'}
      </p>
      <form onSubmit={form.handleSubmit}>
        <Stack tokens={{ childrenGap: 12 }}>
          <FormTextField name="Title" label="Document Title" required />
          <FormTextField name="Author" label="Author" />
          <PrimaryButton type="submit" text="Save Form 3" disabled={form.isSubmitting} />
        </Stack>
      </form>
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Form 3 Values: {JSON.stringify(form.values)}
      </div>
    </div>
  );
};

const MultipleFormsApp: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h1>Multiple Forms Example</h1>
      <p>
        This example shows that each FormProvider creates its own isolated context.
        Each form maintains its own state independently.
      </p>

      {result && (
        <MessageBar
          messageBarType={MessageBarType.success}
          onDismiss={() => setResult(null)}
          style={{ marginBottom: 20 }}
        >
          {result}
        </MessageBar>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Form 1 - Projects */}
        <FormProvider
          config={{
            id: 1,
            listName: 'Projects',
            listUrl: 'https://hieho.sharepoint.com/sites/apps',
            fieldMapping: {
              Title: 'Title',
              Status: 'Status',
            },
            validationSchema: {
              Title: { required: true },
            },
            autoSave: true,
            onSubmit: async (values) => {
              console.log('Form 1 submitted:', values);
              setResult('Form 1 (Projects) saved successfully!');
            },
            onSaveSuccess: (data) => {
              console.log('Form 1 saved:', data);
            },
          }}
        >
          <Form1 />
        </FormProvider>

        {/* Form 2 - Tasks */}
        <FormProvider
          config={{
            id: 2,
            listName: 'Tasks',
            listUrl: 'https://hieho.sharepoint.com/sites/apps',
            fieldMapping: {
              Title: 'Title',
              Priority: 'Priority',
            },
            validationSchema: {
              Title: { required: true },
            },
            autoSave: true,
            onSubmit: async (values) => {
              console.log('Form 2 submitted:', values);
              setResult('Form 2 (Tasks) saved successfully!');
            },
            onSaveSuccess: (data) => {
              console.log('Form 2 saved:', data);
            },
          }}
        >
          <Form2 />
        </FormProvider>

        {/* Form 3 - Documents */}
        <FormProvider
          config={{
            id: 0, // New item
            listName: 'Documents',
            listUrl: 'https://hieho.sharepoint.com/sites/apps',
            fieldMapping: {
              Title: 'Title',
              Author: 'Author',
            },
            validationSchema: {
              Title: { required: true },
            },
            autoSave: true,
            onSubmit: async (values) => {
              console.log('Form 3 submitted:', values);
              setResult('Form 3 (Documents) created successfully!');
            },
            onSaveSuccess: (data) => {
              console.log('Form 3 saved:', data);
            },
          }}
        >
          <Form3 />
        </FormProvider>
      </div>

      <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
        <h3>Key Points:</h3>
        <ul>
          <li>Each FormProvider creates its own isolated React Context</li>
          <li>Each form maintains its own state (values, errors, touched)</li>
          <li>Each form can have different listName, listUrl, and itemId</li>
          <li>Changing values in one form does not affect other forms</li>
          <li>Each form can be submitted independently</li>
        </ul>
      </div>
    </div>
  );
};

export default MultipleFormsApp;

