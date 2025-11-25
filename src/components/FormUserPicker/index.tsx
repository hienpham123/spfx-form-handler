import React, { useCallback } from 'react';
import { NormalPeoplePicker, IPersonaProps, Label } from '@fluentui/react';
import { useField, useFormContext } from '../../core/hooks';
import { FormUserPickerProps } from './types';
import { useUserSearch, useUserResolution, useSelectedPersonas } from './hooks';
import { convertToPersona } from './helpers';

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

  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  const apiService = formContext.apiService;
  const userServiceUrl = formContext.userServiceUrl || formContext.listUrl;

  const { searchUsersFromApi, allUsers, allGroups, setUsers } = useUserSearch(
    apiService,
    userServiceUrl,
    searchUsers,
    allowGroups
  );

  useUserResolution(value, multiSelect, apiService, userServiceUrl, allUsers, allGroups, setUsers);

  const selectedPersonas = useSelectedPersonas(value, multiSelect, allUsers, allGroups);

  const onResolveSuggestions = useCallback(async (
    filterText: string,
    currentPersonas?: IPersonaProps[]
  ): Promise<IPersonaProps[]> => {
    if (!filterText) {
      return [];
    }

    const foundUsers = await searchUsersFromApi(filterText);
    const currentIds = currentPersonas?.map((p) => p.id) || [];
    const available = foundUsers.filter((u) => !currentIds.includes(u.id));

    return available.map(convertToPersona);
  }, [searchUsersFromApi]);

  const onItemsChange = useCallback((items: IPersonaProps[]): void => {
    const allItems = [...allUsers, ...allGroups];
    
    if (multiSelect) {
      const newValues = items.map((item) => {
        const user = allItems.find((u) => u.id === item.id);
        if (user) {
          return { Id: parseInt(user.id), Title: user.title, Name: user.loginName || user.email };
        }
        return { Id: parseInt(item.id || '0'), Title: item.text || '', Name: item.secondaryText || '' };
      });
      onChange(newValues);
    } else {
      const firstItem = items[0];
      if (firstItem) {
        const user = allItems.find((u) => u.id === firstItem.id);
        if (user) {
          onChange({ Id: parseInt(user.id), Title: user.title, Name: user.loginName || user.email });
        } else {
          onChange({ Id: parseInt(firstItem.id || '0'), Title: firstItem.text || '', Name: firstItem.secondaryText || '' });
        }
      } else {
        onChange(null);
      }
    }
  }, [multiSelect, allUsers, allGroups, onChange]);

  const onRemoveSuggestion = useCallback((item: IPersonaProps): void => {
    if (multiSelect) {
      const currentIds = Array.isArray(value) ? value : [];
      const newIds = currentIds.filter((id) => id !== item.id);
      onChange(newIds);
    } else {
      onChange(null);
    }
  }, [multiSelect, value, onChange]);

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
        styles={errorMessage ? {
          ...((props as any)?.styles || {}),
          root: {
            ...((props as any)?.styles?.root || {}),
            selectors: {
              '& .ms-BasePicker-text': {
                borderColor: 'rgb(164, 38, 44) !important',
              },
              '& .ms-BasePicker-text:focus': {
                borderColor: 'rgb(164, 38, 44) !important',
              },
            },
          },
        } : ((props as any)?.styles || {})}
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

export * from './types';

