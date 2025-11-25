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
  allowGroups?: boolean;
  searchUsers?: (searchText: string) => Promise<UserInfo[]>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  itemLimit?: number;
}

