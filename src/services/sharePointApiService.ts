export { createSharePointApiService, registerSharePointWeb } from './sharePointApiService';
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;

        const finalFieldNames = getFieldNames ? getFieldNames() : [];

        if (finalFieldNames.length === 0) {
          const item = await targetWeb.lists.getByTitle(listName).items.getById(itemId).select('*').get();
          return {
            success: true,
            data: item,
            statusCode: 200,
          };
        }

        const fieldMetadataPromises = finalFieldNames.map(fieldName =>
          targetWeb.lists.getByTitle(listName)
            .fields.getByInternalNameOrTitle(fieldName)
            .get()
            .catch(() => null)
        );
        const fieldMetadataResults = await Promise.all(fieldMetadataPromises);

        const userFields: string[] = [];
        const lookupFields: string[] = [];
        const regularFields: string[] = [];

        finalFieldNames.forEach((fieldName, index) => {
          const field = fieldMetadataResults[index];
          if (!field) {
            regularFields.push(fieldName);
            return;
          }

          const fieldType = field.TypeAsString || field.Type || '';
          const fieldTypeLower = fieldType.toLowerCase();

          if (
            field.PrincipalType !== undefined ||
            fieldTypeLower.includes('user') ||
            fieldTypeLower.includes('person')
          ) {
            userFields.push(fieldName);
          } else if (
            (field.LookupListId || field.LookupList) &&
            field.PrincipalType === undefined &&
            !fieldTypeLower.includes('user') &&
            !fieldTypeLower.includes('person') &&
            field['IsDependentLookup'] !== true
          ) {
            lookupFields.push(fieldName);
          } else {
            regularFields.push(fieldName);
          }
        });

        const selectList: string[] = [...regularFields];
        const expandList: string[] = [];

        userFields.forEach(fieldName => {
          selectList.push(fieldName);
          selectList.push(`${fieldName}/Id`);
          selectList.push(`${fieldName}/Title`);
          selectList.push(`${fieldName}/Name`);
          expandList.push(fieldName);
        });

        lookupFields.forEach(fieldName => {
          selectList.push(fieldName);
          selectList.push(`${fieldName}/Id`);
          selectList.push(`${fieldName}/Title`);
          expandList.push(fieldName);
        });

        let query = targetWeb.lists.getByTitle(listName).items.getById(itemId);
        if (expandList.length > 0) {
          query = query.select(...selectList).expand(...expandList);
        } else {
          query = query.select(...selectList);
        }

        const listItem = await query.get();

        return {
          success: true,
          data: listItem,
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

    addItem: async (listName: string, data: any, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const result = await targetWeb.lists.getByTitle(listName).items.add(data);

        return {
          success: true,
          data: result.data,
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

    updateItem: async (listName: string, itemId: number, data: any, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        await targetWeb.lists.getByTitle(listName).items.getById(itemId).update(data);

        const updatedItem = await targetWeb.lists.getByTitle(listName).items.getById(itemId).get();

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

    getListItems: async (listName: string, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const items = await targetWeb.lists.getByTitle(listName).items.select('Id', 'Title').get();

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

    uploadFile: async (listName: string, itemId: number, file: File, fileName?: string, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        let uploadFileName = fileName || file.name;

        if (uploadFileName.length > 255) {
          const ext = uploadFileName.split('.').pop() || '';
          const nameWithoutExt = uploadFileName.substring(0, uploadFileName.lastIndexOf('.'));
          uploadFileName = nameWithoutExt.substring(0, 255 - ext.length - 1) + '.' + ext;
        }

        uploadFileName = uploadFileName.replace(/[\\/:*?"<>|]/g, '_');
        const attachmentFiles = targetWeb
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .attachmentFiles;

        try {
          const allAttachments = await attachmentFiles.get();
          const existingFile = allAttachments.find((att: any) => att.FileName === uploadFileName);

          if (existingFile) {
            try {
              await attachmentFiles.getByName(uploadFileName).delete();
            } catch (deleteError: any) {
              // Ignore delete errors
            }
          }
        } catch (listError: any) {
          // Ignore list errors
        }

        const arrayBuffer = await file.arrayBuffer();
        const result = await attachmentFiles.add(uploadFileName, arrayBuffer);

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

    deleteFile: async (listName: string, itemId: number, fileName: string, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        await targetWeb
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

    getFieldMetadata: async (listName: string, fieldName: string, targetListUrl?: string): Promise<ApiResponse<SharePointFieldMetadata>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const field = await targetWeb
          .lists.getByTitle(listName)
          .fields
          .getByInternalNameOrTitle(fieldName)
          .get();

        const normalizedType = normalizeFieldType(field);

        let lookupListName = field.LookupList || undefined;
        if (lookupListName && isGuid(lookupListName)) {
          try {
            const lookupList = await targetWeb.lists.getById(lookupListName).get();
            lookupListName = lookupList.Title;
          } catch (error: any) {
            // Keep GUID if resolution fails
          }
        }

        const metadata: SharePointFieldMetadata = {
          InternalName: field.InternalName,
          Title: field.Title,
          Type: normalizedType as any,
          Required: field.Required || false,
          ReadOnlyField: field.ReadOnlyField || false,
          Choices: field.Choices || undefined,
          LookupListId: field.LookupListId || undefined,
          LookupListName: lookupListName,
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

    getListFields: async (listName: string, targetListUrl?: string): Promise<ApiResponse<SharePointFieldMetadata[]>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const fields = await targetWeb
          .lists.getByTitle(listName)
          .fields
          .filter("Hidden eq false and ReadOnlyField eq false")
          .get();

        const metadata = fields.map((field: any) => ({
          InternalName: field.InternalName,
          Title: field.Title,
          Type: (normalizeFieldType(field) as any),
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

    searchUsers: async (searchText: string, targetListUrl?: string): Promise<ApiResponse<any[]>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const users = await targetWeb.siteUsers
          .filter(`substringof('${searchText}', Title) or substringof('${searchText}', Email)`)
          .top(20)
          .select('Id', 'Title', 'Email', 'LoginName', 'PrincipalType')
          .get();

        return {
          success: true,
          data: users.map((user: any) => ({
            Id: user.Id,
            Title: user.Title,
            Email: user.Email,
            LoginName: user.LoginName,
            PrincipalType: user.PrincipalType || 1,
          })),
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to search users',
          statusCode: error.status || 500,
        };
      }
    },

    getUserById: async (userId: number, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const user = await targetWeb.siteUsers.getById(userId)
          .select('Id', 'Title', 'Email', 'LoginName', 'PrincipalType')
          .get();

        return {
          success: true,
          data: {
            Id: user.Id,
            Title: user.Title,
            Email: user.Email,
            LoginName: user.LoginName,
            PrincipalType: user.PrincipalType || 1,
          },
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to get user by Id',
          statusCode: error.status || 500,
        };
      }
    },

    getAttachmentFiles: async (listName: string, itemId: number, targetListUrl?: string): Promise<ApiResponse<any>> => {
      try {
        const targetUrl = getWebUrl(targetListUrl, baseUrl, isLocal, isInSharePoint);
        const targetWeb = targetUrl !== baseUrl ? new WebClass(targetUrl) : web;
        const attachments = await targetWeb
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .attachmentFiles.get();

        return {
          success: true,
          data: attachments.map((att: any) => ({
            FileName: att.FileName,
            ServerRelativeUrl: att.ServerRelativeUrl,
            FileSizeBytes: att.FileSizeBytes,
            ContentType: att.ContentType,
          })),
          statusCode: 200,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to load attachment files',
          statusCode: error.status || 500,
        };
      }
    },
  };
};

