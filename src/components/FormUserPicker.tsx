import React, { useMemo, useState, useCallback } from 'react';
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
  const [users, setUsers] = useState<UserInfo[]>([]);

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  // Get API service from form context
  const apiService = formContext.apiService;
  // Use userServiceUrl for user search (web URL), fallback to listUrl if not provided
  const userServiceUrl = formContext.userServiceUrl || formContext.listUrl;

  // Mock users data with avatar URLs - fallback if no API service
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

  // Convert SharePoint user data to UserInfo
  const convertSharePointUser = (spUser: any): UserInfo => {
    const userId = String(spUser.Id || spUser.id || spUser.Id);
    const title = spUser.Title || spUser.title || spUser.Name || '';
    const email = spUser.Email || spUser.email || '';
    const loginName = spUser.LoginName || spUser.loginName || spUser.PrincipalName || '';
    
    // Generate avatar URL if not provided
    const imageUrl = spUser.PictureUrl || spUser.pictureUrl || 
      `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=0078d4&color=fff&size=128`;

    return {
      id: userId,
      title,
      email,
      loginName,
      imageUrl,
    };
  };

  // Search users from SharePoint API
  const searchUsersFromApi = useCallback(async (searchText: string): Promise<UserInfo[]> => {
    // If custom searchUsers function provided, use it
    if (searchUsers) {
      return await searchUsers(searchText);
    }

    // If apiService has searchUsers method, use it
    if (apiService && 'searchUsers' in apiService && typeof apiService.searchUsers === 'function') {
      try {
        // Use userServiceUrl (web URL) for user search, not listUrl
        const response = await apiService.searchUsers(searchText, userServiceUrl);
        if (response.success && response.data) {
          const userInfos = response.data
            .filter((user: any) => {
              // Filter by allowGroups
              if (!allowGroups) {
                // Only return users (PrincipalType === 1), not groups
                return (user.PrincipalType || user.principalType || 1) === 1;
              }
              return true;
            })
            .map(convertSharePointUser);
          
          // Cache users if search text is empty (initial load)
          if (!searchText && userInfos.length > 0) {
            setUsers(userInfos);
          }
          
          return userInfos;
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }

    // Fallback to mock data
    const allItems = [...mockUsers, ...mockGroups];
    if (searchText) {
      return allItems.filter(
        (user) =>
          user.title.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return allItems;
  }, [apiService, userServiceUrl, searchUsers, allowGroups, mockUsers, mockGroups]);

  // Use API users if available, otherwise use mock
  const allUsers = users.length > 0 ? users : mockUsers;
  const allGroups = allowGroups ? (users.length > 0 ? users.filter((u) => {
    // In real API, we'd check PrincipalType, but for mock we check id prefix
    return u.id.startsWith('g');
  }) : mockGroups) : [];

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
    const allItems = [...allUsers, ...allGroups];
    if (multiSelect) {
      const selectedIds = Array.isArray(value) ? value : [];
      return allItems
        .filter((u) => selectedIds.includes(u.id))
        .map(convertToPersona);
    } else {
      const selectedUser = allItems.find((u) => u.id === String(value));
      return selectedUser ? [convertToPersona(selectedUser)] : [];
    }
  }, [value, multiSelect, allUsers, allGroups]);

  // Resolve suggestions for search - async version
  const onResolveSuggestions = async (
    filterText: string, 
    currentPersonas?: IPersonaProps[]
  ): Promise<IPersonaProps[]> => {
    if (!filterText) {
      return [];
    }

    // Search users from API
    const foundUsers = await searchUsersFromApi(filterText);

    // Exclude already selected items
    const currentIds = currentPersonas?.map((p) => p.id) || [];
    const available = foundUsers.filter((u) => !currentIds.includes(u.id));

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
        onEmptyInputFocus={async (currentPersonas?: IPersonaProps[]) => {
          // Show all available users when input is empty
          // Try to load from API first, then fallback to mock
          const foundUsers = await searchUsersFromApi('');
          const currentIds = currentPersonas?.map((p) => p.id) || [];
          const available = foundUsers
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
