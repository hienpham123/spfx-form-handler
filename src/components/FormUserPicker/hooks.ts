import { useState, useCallback, useEffect, useMemo } from 'react';
import { IPersonaProps } from '@fluentui/react';
import { UserInfo } from './types';
import { convertSharePointUser, convertToPersona } from './helpers';

export const useUserSearch = (
  apiService: any,
  userServiceUrl: string | undefined,
  searchUsers?: (searchText: string) => Promise<UserInfo[]>,
  allowGroups: boolean = false
) => {
  const [users, setUsers] = useState<UserInfo[]>([]);

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

  const searchUsersFromApi = useCallback(async (searchText: string): Promise<UserInfo[]> => {
    if (searchUsers) {
      return await searchUsers(searchText);
    }

    if (apiService && 'searchUsers' in apiService && typeof apiService.searchUsers === 'function') {
      try {
        const response = await apiService.searchUsers(searchText, userServiceUrl);
        if (response.success && response.data) {
          const userInfos = response.data
            .filter((user: any) => {
              if (!allowGroups) {
                return (user.PrincipalType || user.principalType || 1) === 1;
              }
              return true;
            })
            .map(convertSharePointUser);
          
          if (!searchText && userInfos.length > 0) {
            setUsers(userInfos);
          }
          
          return userInfos;
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }

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

  const allUsers = users.length > 0 ? users : mockUsers;
  const allGroups = allowGroups ? (users.length > 0 ? users.filter((u) => {
    return u.id.startsWith('g');
  }) : mockGroups) : [];

  return { searchUsersFromApi, allUsers, allGroups, setUsers };
};

export const useUserResolution = (
  value: any,
  multiSelect: boolean,
  apiService: any,
  userServiceUrl: string | undefined,
  allUsers: UserInfo[],
  allGroups: UserInfo[],
  setUsers: React.Dispatch<React.SetStateAction<UserInfo[]>>
) => {
  useEffect(() => {
    const resolveUserFromId = async (userId: number | string) => {
      const idStr = String(userId);
      const idNum = typeof userId === 'number' ? userId : parseInt(userId);
      
      const allItems = [...allUsers, ...allGroups];
      if (allItems.find(u => u.id === idStr)) {
        return;
      }
      
      if (apiService && 'getUserById' in apiService && typeof apiService.getUserById === 'function') {
        try {
          const response = await apiService.getUserById(idNum, userServiceUrl);
          if (response.success && response.data) {
            const userInfo = convertSharePointUser(response.data);
            setUsers(prev => {
              if (prev.find(u => u.id === idStr)) {
                return prev;
              }
              return [...prev, userInfo];
            });
            return;
          }
        } catch (error) {
          console.warn(`Failed to resolve user ${idStr} by Id:`, error);
        }
      }
      
      if (apiService && 'searchUsers' in apiService && typeof apiService.searchUsers === 'function') {
        try {
          const response = await apiService.searchUsers('', userServiceUrl);
          if (response.success && response.data) {
            const user = response.data.find((u: any) => String(u.Id || u.id) === idStr);
            if (user) {
              const userInfo = convertSharePointUser(user);
              setUsers(prev => {
                if (prev.find(u => u.id === idStr)) {
                  return prev;
                }
                return [...prev, userInfo];
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to resolve user ${idStr} by search:`, error);
        }
      }
    };
    
    if (value) {
      if (multiSelect && Array.isArray(value)) {
        value.forEach((v: any) => {
          const id = typeof v === 'object' && v.Id !== undefined ? v.Id : v;
          if (id && (typeof v !== 'object' || (!v.Title && !v.Name && !v.DisplayName))) {
            resolveUserFromId(id);
          }
        });
      } else if (!multiSelect) {
        const id = typeof value === 'object' && value.Id !== undefined ? value.Id : value;
        if (id && (typeof value !== 'object' || (!value.Title && !value.Name && !value.DisplayName))) {
          resolveUserFromId(id);
        }
      }
    }
  }, [value, multiSelect, apiService, userServiceUrl, allUsers, allGroups, setUsers]);
};

export const useSelectedPersonas = (
  value: any,
  multiSelect: boolean,
  allUsers: UserInfo[],
  allGroups: UserInfo[]
): IPersonaProps[] => {
  return useMemo<IPersonaProps[]>(() => {
    const allItems = [...allUsers, ...allGroups];
    
    if (multiSelect) {
      const selectedValues = Array.isArray(value) ? value : [];
      return selectedValues
        .map((v: any) => {
          const id = typeof v === 'object' && v.Id !== undefined ? String(v.Id) : String(v);
          const user = allItems.find((u) => u.id === id);
          if (user) {
            return convertToPersona(user);
          }
          if (typeof v === 'object' && v.Id !== undefined) {
            return convertToPersona(convertSharePointUser(v));
          }
          return null;
        })
        .filter((p): p is IPersonaProps => p !== null);
    } else {
      if (!value) {
        return [];
      }
      
      if (typeof value === 'object' && value.Id !== undefined) {
        const user = allItems.find((u) => u.id === String(value.Id));
        if (user) {
          return [convertToPersona(user)];
        }
        return [convertToPersona(convertSharePointUser(value))];
      }
      
      const selectedUser = allItems.find((u) => u.id === String(value));
      return selectedUser ? [convertToPersona(selectedUser)] : [];
    }
  }, [value, multiSelect, allUsers, allGroups]);
};

