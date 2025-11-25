import {
  createGetItemMethod,
  createAddItemMethod,
  createUpdateItemMethod,
  createGetListItemsMethod,
  createUploadFileMethod,
  createDeleteFileMethod,
  createGetFieldMetadataMethod,
  createGetListFieldsMethod,
  createSearchUsersMethod,
  createGetUserByIdMethod,
  createGetAttachmentFilesMethod,
} from './methods';

let registeredWebClass: any = null;

export const registerSharePointWeb = (WebClass: any) => {
  registeredWebClass = WebClass;
};

export const createSharePointApiService = (
  baseUrl: string,
  getFieldNames?: () => string[]
) => {
  if (!baseUrl) {
    return null;
  }

  let WebClass: any = null;
  try {
    const pnpSpCheck = (window as any).__pnp_sp__ || registeredWebClass;
    if (pnpSpCheck && pnpSpCheck.Web) {
      WebClass = pnpSpCheck.Web;
    } else if (registeredWebClass) {
      WebClass = registeredWebClass;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }

  if (!WebClass) {
    return null;
  }

  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const isInSharePoint = typeof window !== 'undefined' &&
    (!!(window as any)._spPageContextInfo || window.location.href.includes('sharepoint.com'));

  return {
    getItem: createGetItemMethod(WebClass, baseUrl, isLocal, isInSharePoint, getFieldNames),
    addItem: createAddItemMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    updateItem: createUpdateItemMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    getListItems: createGetListItemsMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    uploadFile: createUploadFileMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    deleteFile: createDeleteFileMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    getFieldMetadata: createGetFieldMetadataMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    getListFields: createGetListFieldsMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    searchUsers: createSearchUsersMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    getUserById: createGetUserByIdMethod(WebClass, baseUrl, isLocal, isInSharePoint),
    getAttachmentFiles: createGetAttachmentFilesMethod(WebClass, baseUrl, isLocal, isInSharePoint),
  };
};

