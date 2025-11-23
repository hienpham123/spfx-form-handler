import React, { useState } from 'react';
import {
  FormProvider,
  useForm,
  FormTextField,
  FormDropdown,
  FormDatePicker,
  FormCheckbox,
  FormMultiChoice,
  FormLookup,
  FormUserPicker,
  FormAttachmentPicker,
  mockApi,
} from '../src';
import { PrimaryButton, Stack, MessageBar, MessageBarType, Spinner, Toggle, Text, Pivot, PivotItem } from '@fluentui/react';
import ClassComponentExample from './ClassComponentExample';

interface DemoFormProps {
  onSubmit: (values: any) => Promise<void>;
}

const DemoForm: React.FC<DemoFormProps> = ({ onSubmit }) => {
  const [submitResult, setSubmitResult] = useState<{ type: MessageBarType; message: string } | null>(null);
  const form = useForm();

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allFields = Object.keys(form.values);
    allFields.forEach((field) => {
      form.setTouched(field, true);
    });

    // Validate form
    const isValid = form.validate();
    if (!isValid) {
      return;
    }

    try {
      await onSubmit(form.values);
      
      // If onSubmit doesn't throw, show success
      setSubmitResult({
        type: MessageBarType.success,
        message: `Form submitted successfully! Data: ${JSON.stringify(form.values, null, 2)}`,
      });
      form.reset();
    } catch (error: any) {
      setSubmitResult({
        type: MessageBarType.error,
        message: `Error: ${error.message}`,
      });
    }
  };

  // Show loading spinner while loading item data
  if (form.isLoading) {
    return (
      <div style={{ padding: 20, maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <Spinner label="Loading item data from SharePoint..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>SPFx Form Handler Demo</h1>
      <p>This is a demo of the form handling library. You can test forms without a SharePoint tenant.</p>

      {form.itemData && (
        <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: 20 }}>
          <strong>Item loaded from SharePoint:</strong> List: "{form.listName}", Item ID: {form.itemId}
          <br />
          <small>Mode: Edit existing item | Use getValue/setValue to access form data</small>
        </MessageBar>
      )}

      {!form.itemId && form.listName && (
        <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: 20 }}>
          <strong>New Item Mode:</strong> List: "{form.listName}"
          <br />
          <small>Creating new item. Use getValue/setValue to access form data.</small>
        </MessageBar>
      )}

      {submitResult && (
        <MessageBar
          messageBarType={submitResult.type}
          onDismiss={() => setSubmitResult(null)}
          style={{ marginBottom: 20 }}
        >
          {submitResult.message}
        </MessageBar>
      )}

      <form onSubmit={handleFormSubmit}>
        <Stack tokens={{ childrenGap: 16 }}>
          <FormTextField
            name="title"
            label="Title"
            placeholder="Enter title"
            required
          />

          <FormTextField
            name="email"
            label="Email"
            type="email"
            placeholder="Enter email"
            required
          />

          <FormTextField
            name="description"
            label="Description"
            multiline
            rows={4}
            placeholder="Enter description"
          />

          <FormDropdown
            name="status"
            label="Status"
            options={[
              { key: 'active', text: 'Active' },
              { key: 'inactive', text: 'Inactive' },
              { key: 'pending', text: 'Pending' },
            ]}
            required
          />

          <FormDatePicker
            name="startDate"
            label="Start Date"
            placeholder="Select start date"
            isRequired
          />

          <FormMultiChoice
            name="skills"
            label="Skills"
            options={[
              { key: 'react', text: 'React' },
              { key: 'typescript', text: 'TypeScript' },
              { key: 'spfx', text: 'SPFx' },
              { key: 'sharepoint', text: 'SharePoint' },
            ]}
          />

          <FormCheckbox
            name="agreeToTerms"
            label="I agree to the terms and conditions"
          />

          <FormLookup
            name="category"
            label="Category (Lookup)"
            lookupList="Categories"
            placeholder="Select category"
            required
          />

          <FormLookup
            name="tags"
            label="Tags (Multi-Lookup)"
            lookupList="Tags"
            multiSelect
            placeholder="Select tags"
          />

          <FormUserPicker
            name="assignedTo"
            label="Assigned To (User)"
            placeholder="Select user"
            required
          />

          <FormUserPicker
            name="teamMembers"
            label="Team Members (Multi-User)"
            multiSelect
            placeholder="Select team members"
            allowGroups
          />

          <FormAttachmentPicker
            name="attachments"
            label="Attachments"
            maxSize={10 * 1024 * 1024} // 10MB
            allowedFileTypes={['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'gif']}
            maxFiles={5}
          />

          <div>
            <PrimaryButton
              type="submit"
              text={form.itemData ? "Update Item" : "Create Item"}
              disabled={form.isSubmitting}
              style={{ marginRight: 8 }}
            />
            {form.itemData && (
              <PrimaryButton
                type="button"
                text="Reload Data"
                onClick={form.reloadItemData}
                disabled={form.isLoading}
                style={{ marginRight: 8 }}
              />
            )}
            <PrimaryButton
              type="button"
              text="Reset"
              onClick={form.reset}
              disabled={form.isSubmitting}
            />
          </div>

          <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
            <h3>Form State & Usage Examples:</h3>
            <div style={{ marginBottom: 12 }}>
              <Text variant="small" style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Using getValue() and setValue():
              </Text>
              <Text variant="small" style={{ color: '#666' }}>
                Title: {form.getValue('title') || '(empty)'} | Status: {form.getValue('status') || '(empty)'}
              </Text>
            </div>
            <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 300 }}>
              {JSON.stringify(
                {
                  values: form.values,
                  errors: form.errors,
                  touched: form.touched,
                  isValid: form.isValid,
                  isSubmitting: form.isSubmitting,
                  isLoading: form.isLoading,
                  hasItemData: !!form.itemData,
                  itemId: form.itemId,
                  listName: form.listName,
                  listUrl: form.listUrl,
                  // Example: getValue usage
                  titleValue: form.getValue('title'),
                  statusValue: form.getValue('status'),
                  emailValue: form.getValue('email'),
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
  const [selectedTab, setSelectedTab] = useState<string>('functional');

  return (
    <div style={{ padding: 20 }}>
      <Pivot
        selectedKey={selectedTab}
        onLinkClick={(item) => item && setSelectedTab(item.props.itemKey || 'functional')}
      >
        <PivotItem headerText="Functional Components" itemKey="functional">
          <FunctionalComponentDemo />
        </PivotItem>
        <PivotItem headerText="Class Components" itemKey="class">
          <ClassComponentExample />
        </PivotItem>
      </Pivot>
    </div>
  );
};

const FunctionalComponentDemo: React.FC = () => {
  const [useListConfig, setUseListConfig] = useState(true);
  const [itemId, setItemId] = useState(1);

  // onSubmit is now optional - autoSave will handle saving to SharePoint automatically
  // You can still provide custom onSubmit for additional logic after save
  const handleSubmit = async (values: any) => {
    // Auto save is handled by FormProvider based on id, listName, listUrl
    // This callback is called after successful save
    console.log('Form submitted with values:', values);
    return values;
  };

  return (
    <div>
      <div style={{ maxWidth: 600, margin: '0 auto 20px', padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
        <h3>Configuration</h3>
        <Stack tokens={{ childrenGap: 12 }}>
          <Toggle
            label="Load from SharePoint List Item"
            checked={useListConfig}
            onChange={(_, checked) => setUseListConfig(checked || false)}
            onText="Enabled"
            offText="Disabled"
          />
          {useListConfig && (
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Item ID: 
                <input
                  type="number"
                  value={itemId}
                  onChange={(e) => setItemId(parseInt(e.target.value) || 1)}
                  style={{ marginLeft: 8, padding: 4, width: 80 }}
                />
              </label>
              <small style={{ color: '#666' }}>
                This will load data from list "MyList" with the specified item ID.
                <br />
                <strong>New way:</strong> Use id, listName, listUrl directly in config.
                <br />
                <strong>id &gt; 0:</strong> Edit mode | <strong>id = 0:</strong> New item mode
              </small>
            </div>
          )}
        </Stack>
      </div>

      <FormProvider
        config={{
          // SharePoint List Configuration - New way: direct props
          // id: Item ID (0 or undefined = new item, > 0 = edit existing)
          // listName: SharePoint list name
          // listUrl: Optional SharePoint list URL
          id: useListConfig && itemId && itemId > 0 ? itemId : 0,
          listName: 'MyList',
          // listUrl: 'https://yourtenant.sharepoint.com/sites/yoursite', // Optional
          fieldMapping: {
            // Map SharePoint field names to form field names
            Title: 'title',
            Description: 'description',
            Status: 'status',
            StartDate: 'startDate',
            AssignedToId: 'assignedTo',
            CategoryId: 'category',
            TagsId: 'tags',
          },
          // Custom API service (optional, defaults to mockApi)
          // apiService: {
          //   getItem: async (listName, itemId, listUrl) => {
          //     const response = await sp.web.lists
          //       .getByTitle(listName)
          //       .items.getById(itemId)
          //       .get();
          //     return { success: true, data: response };
          //   },
          //   addItem: async (listName, data, listUrl) => {
          //     const response = await sp.web.lists
          //       .getByTitle(listName)
          //       .items.add(data);
          //     return { success: true, data: response.data };
          //   },
          //   updateItem: async (listName, itemId, data, listUrl) => {
          //     await sp.web.lists
          //       .getByTitle(listName)
          //       .items.getById(itemId)
          //       .update(data);
          //     return { success: true, data: { ...data, Id: itemId } };
          //   },
          // },
          autoSave: true, // Auto save to SharePoint on submit
          onItemLoaded: (itemData) => {
            console.log('Item data loaded from SharePoint:', itemData);
          },
          onLoadError: (error) => {
            console.error('Failed to load item:', error);
          },
          onSaveSuccess: (data) => {
            console.log('Item saved successfully:', data);
          },
          onSaveError: (error) => {
            console.error('Failed to save item:', error);
          },
          initialValues: {
            title: '',
            email: '',
            description: '',
            status: undefined,
            startDate: null,
            skills: [],
            agreeToTerms: false,
            category: undefined,
            tags: [],
            assignedTo: undefined,
            teamMembers: [],
            attachments: [],
          },
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
          description: {
            maxLength: 500,
          },
          status: {
            required: true,
          },
          startDate: {
            required: true,
          },
          agreeToTerms: {
            required: true,
            custom: (value) => {
              if (!value) {
                return 'You must agree to the terms and conditions';
              }
              return null;
            },
          },
          category: {
            required: true,
          },
          assignedTo: {
            required: true,
          },
        },
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: handleSubmit,
      }}
    >
      <DemoForm onSubmit={handleSubmit} />
    </FormProvider>
    </div>
  );
};

