import { UserInfo } from './types';
import { IPersonaProps } from '@fluentui/react';

export const convertSharePointUser = (spUser: any): UserInfo => {
  const userId = String(spUser.Id || spUser.id || spUser.Id);
  const title = spUser.Title || spUser.title || spUser.Name || spUser.DisplayName || `User ${userId}`;
  const email = spUser.Email || spUser.email || '';
  const loginName = spUser.LoginName || spUser.loginName || spUser.PrincipalName || '';
  
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

export const convertToPersona = (user: UserInfo): IPersonaProps => ({
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

