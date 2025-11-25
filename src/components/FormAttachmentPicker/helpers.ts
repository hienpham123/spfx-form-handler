import { AttachmentInfo } from './types';

export const getAttachmentUrl = (attachment: AttachmentInfo, listUrl?: string): string | undefined => {
  if (!attachment.url) return undefined;
  
  if (attachment.url.startsWith('blob:')) {
    return attachment.url;
  }
  
  if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
    return attachment.url;
  }
  
  if (attachment.url.startsWith('/')) {
    if (listUrl) {
      try {
        const urlObj = new URL(listUrl);
        return `${urlObj.protocol}//${urlObj.host}${attachment.url}`;
      } catch (e) {
        console.warn('Failed to build attachment URL:', e);
      }
    }
  }
  
  return attachment.url;
};

export const getFileIcon = (contentType: string): string => {
  if (contentType.startsWith('image/')) return 'Image';
  if (contentType.includes('pdf')) return 'PDF';
  if (contentType.includes('word') || contentType.includes('document')) return 'Word';
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'Excel';
  if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'PowerPoint';
  return 'Document';
};

