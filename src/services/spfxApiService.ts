import { ApiResponse } from '../types';

/**
 * SPFx API Service - Real SharePoint API implementation
 * Use this service when you have access to a SharePoint tenant
 * 
 * @example
 * ```tsx
 * import { sp } from '@pnp/sp';
 * import { createSpfxApiService } from 'spfx-form-handler';
 * 
 * // Initialize SPFx
 * sp.setup({
 *   spfxContext: context, // Your SPFx context
 * });
 * 
 * // Create API service
 * const apiService = createSpfxApiService();
 * 
 * // Use in FormProvider
 * <FormProvider
 *   config={{
 *     id: 1,
 *     listName: 'Projects',
 *     listUrl: 'https://hieho.sharepoint.com/sites/apps',
 *     apiService: apiService,
 *   }}
 * />
 * ```
 */

/**
 * Create SPFx API service using @pnp/sp
 * Requires: npm install @pnp/sp @pnp/logging @pnp/common
 */
export const createSpfxApiService = () => {
  // Dynamic import to avoid errors if @pnp/sp is not installed
  let sp: any;
  
  try {
    // Try to import @pnp/sp
    // In real usage, you would import it at the top:
    // import { sp } from '@pnp/sp';
    // For now, we'll provide a template
    sp = null; // Will be set by user
  } catch (e) {
    console.warn('@pnp/sp not found. Please install it: npm install @pnp/sp');
  }

  return {
    getItem: async (listName: string, itemId: number, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        // If listUrl is provided, use it; otherwise use current web
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        const response = await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .get();

        return {
          success: true,
          data: response,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch list item',
          statusCode: error.status || 500,
        };
      }
    },

    addItem: async (listName: string, data: any, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        const response = await web
          .lists.getByTitle(listName)
          .items.add(data);

        return {
          success: true,
          data: response.data,
          statusCode: 201,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to create list item',
          statusCode: error.status || 500,
        };
      }
    },

    updateItem: async (listName: string, itemId: number, data: any, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .update(data);

        // Fetch updated item
        const updatedItem = await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .get();

        return {
          success: true,
          data: updatedItem,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to update list item',
          statusCode: error.status || 500,
        };
      }
    },

    getListItems: async (listName: string, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        const items = await web
          .lists.getByTitle(listName)
          .items
          .select('Id', 'Title')
          .get();

        return {
          success: true,
          data: items,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch list items',
          statusCode: error.status || 500,
        };
      }
    },

    getFieldMetadata: async (listName: string, fieldName: string, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        const field = await web
          .lists.getByTitle(listName)
          .fields
          .getByInternalNameOrTitle(fieldName)
          .get();

        // Map SharePoint field to our metadata format
        const metadata = {
          InternalName: field.InternalName,
          Title: field.Title,
          Type: field.TypeAsString || field.Type,
          Required: field.Required || false,
          ReadOnlyField: field.ReadOnlyField || false,
          Choices: field.Choices || undefined,
          LookupListId: field.LookupListId || undefined,
          LookupListName: field.LookupList || undefined,
          LookupFieldName: field.LookupField || undefined,
          DefaultValue: field.DefaultValue || undefined,
          Description: field.Description || undefined,
          MaxLength: field.MaxLength || undefined,
          Min: field.Min || undefined,
          Max: field.Max || undefined,
        };

        return {
          success: true,
          data: metadata,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch field metadata',
          statusCode: error.status || 500,
        };
      }
    },

    getListFields: async (listName: string, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        const fields = await web
          .lists.getByTitle(listName)
          .fields
          .filter("Hidden eq false and ReadOnlyField eq false")
          .get();

        const metadata = fields.map((field: any) => ({
          InternalName: field.InternalName,
          Title: field.Title,
          Type: field.TypeAsString || field.Type,
          Required: field.Required || false,
          ReadOnlyField: field.ReadOnlyField || false,
          Choices: field.Choices || undefined,
          LookupListId: field.LookupListId || undefined,
          LookupListName: field.LookupList || undefined,
          LookupFieldName: field.LookupField || undefined,
          DefaultValue: field.DefaultValue || undefined,
          Description: field.Description || undefined,
          MaxLength: field.MaxLength || undefined,
          Min: field.Min || undefined,
          Max: field.Max || undefined,
        }));

        return {
          success: true,
          data: metadata,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch list fields',
          statusCode: error.status || 500,
        };
      }
    },

    uploadFile: async (
      listName: string,
      itemId: number,
      file: File,
      fileName?: string,
      listUrl?: string
    ): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        const uploadFileName = fileName || file.name;
        const attachmentFolder = web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .attachmentFiles;

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        
        const result = await attachmentFolder.add(uploadFileName, arrayBuffer);

        return {
          success: true,
          data: result.data,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to upload file',
          statusCode: error.status || 500,
        };
      }
    },

    deleteFile: async (
      listName: string,
      itemId: number,
      fileName: string,
      listUrl?: string
    ): Promise<ApiResponse<any>> => {
      try {
        const web = listUrl 
          ? sp.web.getUrl() !== listUrl ? sp.site.openWeb(listUrl) : sp.web
          : sp.web;

        await web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .attachmentFiles.getByName(fileName)
          .delete();

        return {
          success: true,
          data: { deleted: true, fileName },
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to delete file',
          statusCode: error.status || 500,
        };
      }
    },
  };
};

/**
 * Create SPFx API service using SharePoint REST API directly
 * Use this if you prefer REST API over @pnp/sp
 */
export const createSpfxRestApiService = (context?: any) => {
  const getWebUrl = (listUrl?: string): string => {
    if (listUrl) {
      return listUrl;
    }
    if (context && context.pageContext && context.pageContext.web) {
      return context.pageContext.web.absoluteUrl;
    }
    return window.location.origin;
  };

  const getApiUrl = (listName: string, listUrl?: string): string => {
    const webUrl = getWebUrl(listUrl);
    return `${webUrl}/_api/web/lists/getbytitle('${listName}')`;
  };

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Accept': 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
    };

    // Add SPFx context headers if available
    if (context && context.spHttpClient) {
      // SPFx will handle authentication automatically
    } else {
      // For non-SPFx environments, you might need to add auth headers
      // headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  return {
    getItem: async (listName: string, itemId: number, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const apiUrl = `${getApiUrl(listName, listUrl)}/items(${itemId})`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        const data = await response.json();
        return {
          success: true,
          data: data,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch list item',
          statusCode: 500,
        };
      }
    },

    addItem: async (listName: string, data: any, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const apiUrl = `${getApiUrl(listName, listUrl)}/items`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            'X-RequestDigest': await getFormDigest(listUrl),
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        const result = await response.json();
        return {
          success: true,
          data: result.d,
          statusCode: 201,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to create list item',
          statusCode: 500,
        };
      }
    },

    updateItem: async (listName: string, itemId: number, data: any, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const apiUrl = `${getApiUrl(listName, listUrl)}/items(${itemId})`;
        const response = await fetch(apiUrl, {
          method: 'MERGE',
          headers: {
            ...getHeaders(),
            'X-RequestDigest': await getFormDigest(listUrl),
            'IF-MATCH': '*',
            'X-HTTP-Method': 'MERGE',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        // Fetch updated item
        const getResponse = await fetch(`${apiUrl}`, {
          method: 'GET',
          headers: getHeaders(),
        });

        const updatedData = await getResponse.json();
        return {
          success: true,
          data: updatedData,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to update list item',
          statusCode: 500,
        };
      }
    },

    getListItems: async (listName: string, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const webUrl = getWebUrl(listUrl);
        const apiUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$select=Id,Title`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        const data = await response.json();
        return {
          success: true,
          data: data.d?.results || data.value || [],
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch list items',
          statusCode: 500,
        };
      }
    },

    getFieldMetadata: async (listName: string, fieldName: string, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const webUrl = getWebUrl(listUrl);
        const apiUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/fields/getbyinternalnameortitle('${fieldName}')`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        const field = await response.json();
        const data = field.d || field;

        // Map SharePoint field to our metadata format
        const metadata = {
          InternalName: data.InternalName,
          Title: data.Title,
          Type: data.TypeAsString || data.Type,
          Required: data.Required || false,
          ReadOnlyField: data.ReadOnlyField || false,
          Choices: data.Choices?.results || data.Choices || undefined,
          LookupListId: data.LookupListId || undefined,
          LookupListName: data.LookupList || undefined,
          LookupFieldName: data.LookupField || undefined,
          DefaultValue: data.DefaultValue || undefined,
          Description: data.Description || undefined,
          MaxLength: data.MaxLength || undefined,
          Min: data.Min || undefined,
          Max: data.Max || undefined,
        };

        return {
          success: true,
          data: metadata,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch field metadata',
          statusCode: 500,
        };
      }
    },

    getListFields: async (listName: string, listUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const webUrl = getWebUrl(listUrl);
        const apiUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/fields?$filter=Hidden eq false and ReadOnlyField eq false`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        const data = await response.json();
        const fields = data.d?.results || data.value || [];

        const metadata = fields.map((field: any) => ({
          InternalName: field.InternalName,
          Title: field.Title,
          Type: field.TypeAsString || field.Type,
          Required: field.Required || false,
          ReadOnlyField: field.ReadOnlyField || false,
          Choices: field.Choices?.results || field.Choices || undefined,
          LookupListId: field.LookupListId || undefined,
          LookupListName: field.LookupList || undefined,
          LookupFieldName: field.LookupField || undefined,
          DefaultValue: field.DefaultValue || undefined,
          Description: field.Description || undefined,
          MaxLength: field.MaxLength || undefined,
          Min: field.Min || undefined,
          Max: field.Max || undefined,
        }));

        return {
          success: true,
          data: metadata,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch list fields',
          statusCode: 500,
        };
      }
    },

    uploadFile: async (
      listName: string,
      itemId: number,
      file: File,
      fileName?: string,
      listUrl?: string
    ): Promise<ApiResponse<any>> => {
      try {
        const webUrl = getWebUrl(listUrl);
        const uploadFileName = fileName || file.name;
        const apiUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})/AttachmentFiles/add(FileName='${encodeURIComponent(uploadFileName)}')`;
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            'X-RequestDigest': await getFormDigest(listUrl),
            'binaryStringRequestBody': 'true',
          },
          body: arrayBuffer,
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        const data = await response.json();
        return {
          success: true,
          data: data.d || data,
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to upload file',
          statusCode: 500,
        };
      }
    },

    deleteFile: async (
      listName: string,
      itemId: number,
      fileName: string,
      listUrl?: string
    ): Promise<ApiResponse<any>> => {
      try {
        const webUrl = getWebUrl(listUrl);
        const apiUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})/AttachmentFiles/getByFileName('${encodeURIComponent(fileName)}')`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            ...getHeaders(),
            'X-RequestDigest': await getFormDigest(listUrl),
            'X-HTTP-Method': 'DELETE',
            'IF-MATCH': '*',
          },
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            success: false,
            error: error || `HTTP ${response.status}`,
            statusCode: response.status,
          };
        }

        return {
          success: true,
          data: { deleted: true, fileName },
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to delete file',
          statusCode: 500,
        };
      }
    },
  };
};

/**
 * Get form digest for REST API requests
 */
const getFormDigest = async (listUrl?: string): Promise<string> => {
  try {
    const webUrl = listUrl || window.location.origin;
    const digestUrl = `${webUrl}/_api/contextinfo`;
    const response = await fetch(digestUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=nometadata',
      },
    });
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  } catch (error) {
    console.error('Failed to get form digest:', error);
    return '';
  }
};

