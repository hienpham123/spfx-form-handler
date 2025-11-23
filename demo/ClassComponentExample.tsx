import React from 'react';
import {
  FormProvider,
  withForm,
  WithFormProps,
  FormConsumer,
  FormTextField,
  FormDropdown,
  FormDatePicker,
  FormCheckbox,
  FormField,
} from '../src';
import { PrimaryButton, Stack, MessageBar, MessageBarType, Text } from '@fluentui/react';

/**
 * Example 1: Using withForm HOC with basic form components
 */
interface MyFormProps {
  title?: string;
}

class MyFormComponent extends React.Component<MyFormProps & WithFormProps> {
  render() {
    const { form, title = 'My Form' } = this.props;

    return (
      <div style={{ padding: 20, maxWidth: 600 }}>
        <h2>{title}</h2>
        
        {form.isSubmitting && (
          <MessageBar messageBarType={MessageBarType.info}>
            Submitting form...
          </MessageBar>
        )}

        <form onSubmit={form.handleSubmit}>
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
                { key: 'inactive', text: 'Inactive' },
                { key: 'pending', text: 'Pending' },
              ]}
              required
            />

            <FormDatePicker
              name="startDate"
              label="Start Date"
              placeholder="Select a date"
            />

            <FormCheckbox
              name="agreeToTerms"
              label="I agree to the terms and conditions"
            />

            <div>
              <Text variant="small" style={{ color: '#666', marginBottom: 8 }}>
                Form Values:
              </Text>
              <pre style={{ fontSize: 11, backgroundColor: '#f3f2f1', padding: 8, borderRadius: 4, overflow: 'auto' }}>
                {JSON.stringify(form.values, null, 2)}
              </pre>
            </div>

            <div>
              <Text variant="small" style={{ color: '#666', marginBottom: 8 }}>
                Form Errors:
              </Text>
              <pre style={{ fontSize: 11, backgroundColor: '#f3f2f1', padding: 8, borderRadius: 4, overflow: 'auto' }}>
                {JSON.stringify(form.errors, null, 2)}
              </pre>
            </div>

            <div>
              <PrimaryButton
                type="submit"
                text="Submit"
                disabled={form.isSubmitting || !form.isValid}
              />
              <PrimaryButton
                text="Reset"
                onClick={() => form.reset()}
                disabled={form.isSubmitting}
                style={{ marginLeft: 8 }}
              />
            </div>
          </Stack>
        </form>
      </div>
    );
  }
}

// Wrap component with withForm HOC
const MyForm = withForm(MyFormComponent);

/**
 * Example 2: Using FormConsumer (Render Props Pattern)
 */
class FormConsumerExample extends React.Component {
  render() {
    return (
      <div style={{ padding: 20, maxWidth: 600 }}>
        <h2>FormConsumer Example</h2>
        
        <FormConsumer>
          {(form) => (
            <form onSubmit={form.handleSubmit}>
              <Stack tokens={{ childrenGap: 16 }}>
                <FormTextField
                  name="name"
                  label="Name"
                  required
                />

                <FormTextField
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                />

                <div>
                  <Text variant="small">
                    Is Valid: {form.isValid ? 'Yes' : 'No'} | 
                    Is Submitting: {form.isSubmitting ? 'Yes' : 'No'}
                  </Text>
                </div>

                <PrimaryButton
                  type="submit"
                  text="Submit"
                  disabled={form.isSubmitting}
                />
              </Stack>
            </form>
          )}
        </FormConsumer>
      </div>
    );
  }
}

/**
 * Example 3: Using withForm with SharePoint List (FormField)
 */
interface ProjectFormProps {
  projectId?: number;
}

class ProjectFormComponent extends React.Component<ProjectFormProps & WithFormProps> {
  componentDidMount() {
    const { form, projectId } = this.props;
    
    // Reload data if projectId changes
    if (projectId && projectId > 0) {
      form.reloadItemData();
    }
  }

  componentDidUpdate(prevProps: ProjectFormProps & WithFormProps) {
    const { form, projectId } = this.props;
    
    // Reload data if projectId changes
    if (projectId !== prevProps.projectId && projectId && projectId > 0) {
      form.reloadItemData();
    }
  }

  render() {
    const { form, projectId } = this.props;

    if (form.isLoading) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <Text>Loading project data...</Text>
        </div>
      );
    }

    return (
      <div style={{ padding: 20, maxWidth: 600 }}>
        <h2>Project Form (Class Component)</h2>
        <p>
          <strong>Mode:</strong> {projectId ? `Edit Project #${projectId}` : 'Create New Project'}
        </p>

        <form onSubmit={form.handleSubmit}>
          <Stack tokens={{ childrenGap: 16 }}>
            {/* Using FormField - automatically detects field type */}
            <FormField fieldName="Title" />
            <FormField fieldName="ProjectCode" />
            <FormField fieldName="StartDate" />
            <FormField fieldName="EndDate" />
            <FormField fieldName="Status" />
            <FormField fieldName="Category" />
            <FormField fieldName="AssignedTo" />
            <FormField fieldName="Description" />
            <FormField fieldName="IsActive" />

            {/* Display form state */}
            <div style={{ padding: 16, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
              <Text variant="small" style={{ fontWeight: 600, marginBottom: 8 }}>
                Form State:
              </Text>
              <div style={{ fontSize: 11 }}>
                <div><strong>Valid:</strong> {form.isValid ? 'Yes' : 'No'}</div>
                <div><strong>Submitting:</strong> {form.isSubmitting ? 'Yes' : 'No'}</div>
                <div><strong>Loading:</strong> {form.isLoading ? 'Yes' : 'No'}</div>
                <div><strong>Item ID:</strong> {form.itemId || 'N/A'}</div>
                <div><strong>List Name:</strong> {form.listName || 'N/A'}</div>
              </div>
            </div>

            <div>
              <PrimaryButton
                type="submit"
                text={projectId ? "Update Project" : "Create Project"}
                disabled={form.isSubmitting || !form.isValid}
              />
              {projectId && (
                <PrimaryButton
                  text="Reload Data"
                  onClick={() => form.reloadItemData()}
                  disabled={form.isLoading}
                  style={{ marginLeft: 8 }}
                />
              )}
            </div>
          </Stack>
        </form>
      </div>
    );
  }
}

const ProjectForm = withForm(ProjectFormComponent);

/**
 * Main App Component
 */
class ClassComponentApp extends React.Component {
  state = {
    projectId: 0,
    showProjectForm: false,
  };

  handleProjectIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const projectId = parseInt(e.target.value) || 0;
    this.setState({ projectId });
  };

  toggleProjectForm = () => {
    this.setState({ showProjectForm: !this.state.showProjectForm });
  };

  render() {
    const { projectId, showProjectForm } = this.state;

    return (
      <div style={{ padding: 20 }}>
        <h1>Class Component Examples</h1>
        
        <div style={{ marginBottom: 40, padding: 20, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
          <h3>Example 1: withForm HOC with Basic Components</h3>
          <FormProvider
            config={{
              initialValues: {
                title: '',
                email: '',
                status: undefined,
                startDate: undefined,
                agreeToTerms: false,
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
                alert('Form submitted successfully!');
              },
              onSaveSuccess: (data) => {
                console.log('Save success:', data);
              },
              onSaveError: (error) => {
                console.error('Save error:', error);
              },
            }}
          >
            <MyForm title="Basic Form Example" />
          </FormProvider>
        </div>

        <div style={{ marginBottom: 40, padding: 20, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
          <h3>Example 2: FormConsumer (Render Props)</h3>
          <FormProvider
            config={{
              initialValues: {
                name: '',
                description: '',
              },
              validationSchema: {
                name: {
                  required: true,
                  minLength: 2,
                },
              },
              onSubmit: async (values) => {
                console.log('FormConsumer submitted:', values);
                alert('FormConsumer submitted successfully!');
              },
            }}
          >
            <FormConsumerExample />
          </FormProvider>
        </div>

        <div style={{ marginBottom: 40, padding: 20, backgroundColor: '#f3f2f1', borderRadius: 4 }}>
          <h3>Example 3: withForm with SharePoint List (FormField)</h3>
          <div style={{ marginBottom: 16 }}>
            <label>
              Project ID (0 = new, &gt; 0 = edit):{' '}
              <input
                type="number"
                value={projectId}
                onChange={this.handleProjectIdChange}
                style={{ marginLeft: 8, padding: 4 }}
              />
            </label>
            <PrimaryButton
              text={showProjectForm ? "Hide Project Form" : "Show Project Form"}
              onClick={this.toggleProjectForm}
              style={{ marginLeft: 16 }}
            />
          </div>

          {showProjectForm && (
            <FormProvider
              config={{
                id: projectId,
                listName: 'Projects',
                listUrl: 'https://hieho.sharepoint.com/sites/apps', // Web URL hoặc List URL
                // userServiceUrl: 'https://hieho.sharepoint.com/sites/apps', // Optional: Web URL riêng cho user search
                autoSave: true,
                validationSchema: {
                  Title: {
                    required: true,
                    minLength: 3,
                  },
                },
                onBeforeSave: (values) => {
                  console.log('Before save:', values);
                  return {
                    ...values,
                    StartDate: values.StartDate ? new Date(values.StartDate).toISOString() : null,
                    EndDate: values.EndDate ? new Date(values.EndDate).toISOString() : null,
                  };
                },
                onValidSave: (form) => {
                  if (!form.isValid) return false;
                  
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
                  
                  return true;
                },
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
              <ProjectForm projectId={projectId} />
            </FormProvider>
          )}
        </div>
      </div>
    );
  }
}

export default ClassComponentApp;

