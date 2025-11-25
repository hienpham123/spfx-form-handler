import { FormState } from '../types';

export const extractWebUrl = (url?: string): string | undefined => {
  if (!url) return undefined;

  const listsMatch = url.match(/^(.+?)\/(?:Lists|lists)\//i);
  if (listsMatch) {
    return listsMatch[1];
  }

  if (url.match(/\/sites\/|\/teams\/|^https?:\/\/[^\/]+$/i)) {
    return url;
  }

  return url;
};

export const mapSharePointDataToForm = (
  spData: any,
  fieldMapping: Record<string, string>
): FormState => {
  const mappedData: FormState = {};
  const processedFields = new Set<string>();

  Object.keys(spData).forEach((spFieldName) => {
    if (processedFields.has(spFieldName) || spFieldName.startsWith('odata.') || spFieldName.includes('@odata')) {
      return;
    }

    const formFieldName = fieldMapping[spFieldName] || spFieldName;
    const value = spData[spFieldName];

    if (value === null || value === undefined) {
      mappedData[formFieldName] = null;
      processedFields.add(spFieldName);
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value) && value.Id !== undefined && value.Name !== undefined) {
      mappedData[formFieldName] = {
        Id: value.Id,
        Title: value.Title,
        Name: value.Name
      };
      processedFields.add(spFieldName);
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value) && value.Id !== undefined && value.Title !== undefined && !value.Name) {
      mappedData[formFieldName] = {
        Id: value.Id,
        Title: value.Title
      };
      processedFields.add(spFieldName);
      return;
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0].Id !== undefined) {
      mappedData[formFieldName] = value.map((item: any) => {
        if (item.Name) {
          return { Id: item.Id, Title: item.Title, Name: item.Name };
        } else {
          return { Id: item.Id, Title: item.Title };
        }
      });
      processedFields.add(spFieldName);
      return;
    }

    mappedData[formFieldName] = value;
    processedFields.add(spFieldName);
  });

  return mappedData;
};

export const mapFormDataToSharePoint = (
  formData: FormState,
  fieldMapping: Record<string, string>,
  originalAttachments?: any[],
  dirtyFields?: string[]
): { spData: any; filesToUpload: Array<{ formFieldName: string; attachment: any }>; filesToDelete: Array<{ formFieldName: string; fileName: string }> } => {
  const reverseMapping: Record<string, string> = {};
  Object.keys(fieldMapping).forEach((spField) => {
    reverseMapping[fieldMapping[spField]] = spField;
  });

  const spData: any = {};
  const filesToUpload: Array<{ formFieldName: string; attachment: any }> = [];
  const filesToDelete: Array<{ formFieldName: string; fileName: string }> = [];

  const fieldsToProcess = dirtyFields && dirtyFields.length > 0 ? dirtyFields : Object.keys(formData);

  fieldsToProcess.forEach((formFieldName) => {
    const spFieldName = reverseMapping[formFieldName] || formFieldName;
    const fieldValue = formData[formFieldName];

    const isAttachmentField = formFieldName.toLowerCase().includes('attachment') || 
                              spFieldName.toLowerCase().includes('attachment');

    if (Array.isArray(fieldValue) && isAttachmentField) {
      const currentFileNames = new Set(
        fieldValue
          .filter((item: any) => item?.id || item?.name)
          .map((item: any) => item.id || item.name)
      );

      const originalFileNames = new Set(
        Array.isArray(originalAttachments)
          ? originalAttachments.map((att: any) => att.FileName || att.Name || att.id || '')
          : []
      );

      fieldValue.forEach((attachment: any) => {
        if (attachment?.file && !attachment?.id) {
          filesToUpload.push({ formFieldName, attachment });
        }
      });

      originalFileNames.forEach((fileName: string) => {
        if (fileName && !currentFileNames.has(fileName)) {
          filesToDelete.push({ formFieldName, fileName });
        }
      });
    } else if (Array.isArray(fieldValue) && fieldValue.length > 0) {
      const hasNewFiles = fieldValue.some((item: any) => item?.file && !item?.id);
      if (hasNewFiles) {
        fieldValue.forEach((item: any) => {
          if (item?.file && !item?.id) {
            filesToUpload.push({ formFieldName, attachment: item });
          }
        });
      } else if (fieldValue[0] && typeof fieldValue[0] === 'object' && fieldValue[0].Id !== undefined) {
        const ids = fieldValue.map((item: any) => {
          const id = item.Id;
          return typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
        });
        spData[`${spFieldName}Id`] = { results: ids };
      } else {
        spData[spFieldName] = fieldValue;
      }
    } else if (typeof fieldValue === 'object' && fieldValue !== null && fieldValue.Id !== undefined) {
      spData[`${spFieldName}Id`] = fieldValue.Id;
    } else if (!isAttachmentField) {
      spData[spFieldName] = fieldValue;
    }
  });

  return { spData, filesToUpload, filesToDelete };
};
