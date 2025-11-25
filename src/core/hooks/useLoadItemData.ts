import { useCallback, useEffect, useRef } from 'react';
import { FormState } from '../../types';
import { mapSharePointDataToForm } from '../../utils/formHelpers';

interface UseLoadItemDataProps {
  itemId?: number;
  listName?: string;
  listUrl?: string;
  fieldMapping: Record<string, string>;
  apiService: any;
  registeredFields: Set<string>;
  config: {
    initialValues?: FormState;
    onItemLoaded?: (data: any) => void;
    onLoadError?: (error: string) => void;
  };
  setIsLoading: (loading: boolean) => void;
  setItemData: (data: any) => void;
  setOriginalAttachments: (attachments: any[]) => void;
  setValues: (values: FormState) => void;
  setInitialValuesRef: (values: FormState) => void;
}

export const useLoadItemData = ({
  itemId,
  listName,
  listUrl,
  fieldMapping,
  apiService,
  registeredFields,
  config,
  setIsLoading,
  setItemData,
  setOriginalAttachments,
  setValues,
  setInitialValuesRef,
}: UseLoadItemDataProps) => {
  const loadItemData = useCallback(async () => {
    if (!itemId || itemId === 0 || !listName) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getItem(listName, itemId, listUrl);

      if (response.success && response.data) {
        setItemData(response.data);

        const mappedData = mapSharePointDataToForm(response.data, fieldMapping);

        try {
          if (apiService.getAttachmentFiles && typeof apiService.getAttachmentFiles === 'function') {
            const attachmentResponse = await apiService.getAttachmentFiles(listName, itemId, listUrl);
            if (attachmentResponse && attachmentResponse.success && attachmentResponse.data) {
              const rawAttachments = Array.isArray(attachmentResponse.data) ? attachmentResponse.data : [];
              
              setOriginalAttachments(rawAttachments);

              const attachments = rawAttachments.map((att: any) => ({
                id: att.FileName || att.Name || att.Id,
                name: att.FileName || att.Name || att.ServerRelativeUrl?.split('/').pop() || 'Unknown',
                size: att.FileSizeBytes || att.Length || 0,
                url: att.ServerRelativeUrl || att.Url || '',
                contentType: att.ContentType || '',
              }));

              const attachmentFieldName = Object.keys(mappedData).find(
                key => key.toLowerCase() === 'attachments' || key.toLowerCase().includes('attachment')
              ) || 'Attachments';

              if (attachments.length > 0) {
                mappedData[attachmentFieldName] = attachments;
              }
            } else {
              setOriginalAttachments([]);
            }
          } else {
            setOriginalAttachments([]);
          }
        } catch (attachmentError: any) {
          setOriginalAttachments([]);
        }

        const mergedValues = {
          ...mappedData,
          ...(config.initialValues || {}),
        };

        setValues(mergedValues);
        setInitialValuesRef(mergedValues);

        if (config.onItemLoaded) {
          config.onItemLoaded(response.data);
        }
      } else {
        const errorMsg = response.error || 'Failed to load item data';
        if (config.onLoadError) {
          config.onLoadError(errorMsg);
        }
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to load item data';
      if (config.onLoadError) {
        config.onLoadError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemId, listName, listUrl, fieldMapping, apiService, config, setIsLoading, setItemData, setOriginalAttachments, setValues, setInitialValuesRef]);

  const hasLoadedRef = useRef<string>('');
  useEffect(() => {
    if (itemId && itemId > 0 && listName) {
      const key = `${itemId}_${listName}`;

      if (registeredFields.size > 0 && hasLoadedRef.current !== key) {
        hasLoadedRef.current = key;
        loadItemData();
      } else if (registeredFields.size === 0) {
        const timer = setTimeout(() => {
          if (registeredFields.size > 0 && hasLoadedRef.current !== key) {
            hasLoadedRef.current = key;
            loadItemData();
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, listName, listUrl, registeredFields.size]);

  return loadItemData;
};

