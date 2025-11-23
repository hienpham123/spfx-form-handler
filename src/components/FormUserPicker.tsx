import React, { useMemo } from 'react';
import { 
  NormalPeoplePicker,
  IPersonaProps,
  Label
} from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface UserInfo {
  id: string;
  title: string;
  email: string;
  loginName?: string;
  imageUrl?: string;
}

export interface FormUserPickerProps {
  name: string;
  label?: string;
  multiSelect?: boolean;
  allowGroups?: boolean; // Allow selecting groups in addition to users
  searchUsers?: (searchText: string) => Promise<UserInfo[]>; // Custom search function
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  itemLimit?: number; // Maximum number of items for multi-select
}

/**
 * FormUserPicker component for SharePoint User/People fields
 * Uses NormalPeoplePicker from Fluent UI with avatar support
 * Supports both single and multi-select user picker
 * 
 * @example
 * ```tsx
 * // Single select user picker
 * <FormUserPicker
 *   name="assignedTo"
 *   label="Assigned To"
 *   required
 * />
 * 
 * // Multi-select user picker
 * <FormUserPicker
 *   name="teamMembers"
 *   label="Team Members"
 *   multiSelect
 *   itemLimit={5}
 * />
 * ```
 */
export const FormUserPicker: React.FC<FormUserPickerProps> = ({ 
  name,
  label,
  multiSelect = false,
  allowGroups = false,
  searchUsers,
  placeholder,
  required,
  disabled,
  itemLimit,
  ...props 
}) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext();

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Mock users data with avatar URLs - in real SPFx, this would come from SharePoint
  const mockUsers = useMemo<UserInfo[]>(() => [
    {
      id: '1',
      title: 'John Doe',
      email: 'john.doe@example.com',
      loginName: 'i:0#.f|membership|john.doe@example.com',
      imageUrl: `https://ui-avatars.com/api/?name=John+Doe&background=0078d4&color=fff&size=128`,
    },
    {
      id: '2',
      title: 'Jane Smith',
      email: 'jane.smith@example.com',
      loginName: 'i:0#.f|membership|jane.smith@example.com',
      imageUrl: `https://ui-avatars.com/api/?name=Jane+Smith&background=107c10&color=fff&size=128`,
    },
    {
      id: '3',
      title: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      loginName: 'i:0#.f|membership|bob.johnson@example.com',
      imageUrl: `https://ui-avatars.com/api/?name=Bob+Johnson&background=ffaa44&color=fff&size=128`,
    },
    {
      id: '4',
      title: 'Alice Williams',
      email: 'alice.williams@example.com',
      loginName: 'i:0#.f|membership|alice.williams@example.com',
      imageUrl: `https://ui-avatars.com/api/?name=Alice+Williams&background=d13438&color=fff&size=128`,
    },
    {
      id: '5',
      title: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      loginName: 'i:0#.f|membership|charlie.brown@example.com',
      imageUrl: `https://ui-avatars.com/api/?name=Charlie+Brown&background=8764b8&color=fff&size=128`,
    },
  ], []);

  // Mock groups if allowed
  const mockGroups = useMemo<UserInfo[]>(() => 
    allowGroups ? [
      {
        id: 'g1',
        title: 'IT Department',
        email: 'it@example.com',
        loginName: 'c:0o.c|federateddirectoryclaimprovider|it-department',
        imageUrl: `https://ui-avatars.com/api/?name=IT+Dept&background=0078d4&color=fff&size=128`,
      },
      {
        id: 'g2',
        title: 'Management Team',
        email: 'management@example.com',
        loginName: 'c:0o.c|federateddirectoryclaimprovider|management-team',
        imageUrl: `https://ui-avatars.com/api/?name=Mgmt+Team&background=107c10&color=fff&size=128`,
      },
    ] : []
  , [allowGroups]);

  // Convert UserInfo to IPersonaProps for NormalPeoplePicker
  const convertToPersona = (user: UserInfo): IPersonaProps => ({
    id: user.id,
    text: user.title,
    secondaryText: user.email,
    imageUrl: user.imageUrl,
    imageInitials: user.title
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2),
  });

  // Get selected personas
  const selectedPersonas = useMemo<IPersonaProps[]>(() => {
    const allItems = [...mockUsers, ...mockGroups];
    if (multiSelect) {
      const selectedIds = Array.isArray(value) ? value : [];
      return allItems
        .filter((u) => selectedIds.includes(u.id))
        .map(convertToPersona);
    } else {
      const selectedUser = allItems.find((u) => u.id === value);
      return selectedUser ? [convertToPersona(selectedUser)] : [];
    }
  }, [value, multiSelect, mockUsers, mockGroups]);

  // Resolve suggestions for search
  const onResolveSuggestions = (filterText: string, currentPersonas?: IPersonaProps[]): IPersonaProps[] => {
    if (!filterText) {
      return [];
    }

    const allItems = [...mockUsers, ...mockGroups];
    const filtered = allItems.filter(
      (user) =>
        user.title.toLowerCase().includes(filterText.toLowerCase()) ||
        user.email.toLowerCase().includes(filterText.toLowerCase())
    );

    // Exclude already selected items
    const currentIds = currentPersonas?.map((p) => p.id) || [];
    const available = filtered.filter((u) => !currentIds.includes(u.id));

    return available.map(convertToPersona);
  };

  // Handle selection change
  const onItemsChange = (items: IPersonaProps[]): void => {
    if (multiSelect) {
      const newIds = items.map((item) => item.id as string);
      onChange(newIds);
    } else {
      // For single select, only take the first item
      const firstItem = items[0];
      onChange(firstItem?.id || null);
    }
  };

  // Handle remove
  const onRemoveSuggestion = (item: IPersonaProps): void => {
    if (multiSelect) {
      const currentIds = Array.isArray(value) ? value : [];
      const newIds = currentIds.filter((id) => id !== item.id);
      onChange(newIds);
    } else {
      onChange(null);
    }
  };

  // Get error message
  const errorMessage = touched && error ? error.message : undefined;

  return (
    <div>
      {label && (
        <Label required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      <NormalPeoplePicker
        onResolveSuggestions={onResolveSuggestions}
        onEmptyInputFocus={(currentPersonas?: IPersonaProps[]) => {
          // Show all available users when input is empty
          const allItems = [...mockUsers, ...mockGroups];
          const currentIds = currentPersonas?.map((p) => p.id) || [];
          const available = allItems
            .filter((u) => !currentIds.includes(u.id))
            .map(convertToPersona);
          return available;
        }}
        getTextFromItem={(persona: IPersonaProps) => persona.text || ''}
        pickerSuggestionsProps={{
          suggestionsHeaderText: 'Suggested People',
          noResultsFoundText: 'No results found',
          loadingText: 'Loading...',
        }}
        selectedItems={selectedPersonas}
        onChange={onItemsChange}
        onRemoveSuggestion={onRemoveSuggestion}
        onBlur={onBlur}
        disabled={disabled}
        itemLimit={multiSelect ? (itemLimit || undefined) : 1}
        inputProps={{
          placeholder: placeholder || `Type a name or email${multiSelect ? '' : ''}`,
          'aria-label': label || 'People picker',
        }}
        removeButtonAriaLabel="Remove"
        {...(props as any)}
      />
      {errorMessage && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};
