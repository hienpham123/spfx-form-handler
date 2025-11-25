export const isGuid = (str: string): boolean => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(str);
};

export const normalizeFieldType = (field: any): string => {
  let normalizedType = field.TypeAsString || field.Type || '';

  if (normalizedType === 'Attachments' || field.InternalName === 'Attachments') {
    return 'Attachment';
  }

  if (
    field.PrincipalType !== undefined ||
    normalizedType.toLowerCase().includes('user') ||
    normalizedType.toLowerCase().includes('person')
  ) {
    if (normalizedType.toLowerCase().includes('multi') || field.AllowMultipleValues === true) {
      return 'UserMulti';
    }
    return 'User';
  }

  if (field.LookupListId || field.LookupList) {
    if (normalizedType.toLowerCase().includes('multi') || field.AllowMultipleValues === true) {
      return 'LookupMulti';
    }
    return 'Lookup';
  }

  return normalizedType;
};

export const getWebUrl = (url: string | undefined, baseUrl: string, isLocal: boolean, isInSharePoint: boolean): string => {
  if (!url) return baseUrl;

  if (isLocal && !isInSharePoint) {
    if (url.includes('localhost:8080')) {
      return url;
    }
    if (url.includes('sharepoint.com')) {
      try {
        const urlObj = new URL(url);
        return `http://localhost:8080${urlObj.pathname}`;
      } catch (e) {
        return url;
      }
    }
  }

  return url;
};

