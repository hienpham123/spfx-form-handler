import React, { useRef, useState } from 'react';
import {
  IconButton,
  Stack,
  Text,
  Label,
  MessageBar,
  MessageBarType,
  ProgressIndicator,
} from '@fluentui/react';
import { useField, useFormContext } from '../core/hooks';

export interface AttachmentInfo {
  id?: string;
  name: string;
  size: number;
  url?: string;
  contentType: string;
  file?: File; // For new uploads
}

export interface FormAttachmentPickerProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  maxSize?: number; // Max file size in bytes (default: 10MB)
  allowedFileTypes?: string[]; // e.g., ['pdf', 'docx', 'jpg']
  maxFiles?: number; // Maximum number of files
  uploadFile?: (file: File) => Promise<AttachmentInfo>; // Custom upload function
  onFileUploaded?: (attachment: AttachmentInfo) => void;
  onFileRemoved?: (attachment: AttachmentInfo) => void;
}

/**
 * FormAttachmentPicker component for SharePoint Attachment fields
 * Supports file upload, preview, and removal
 * 
 * @example
 * ```tsx
 * <FormAttachmentPicker
 *   name="attachments"
 *   label="Attachments"
 *   maxSize={10485760} // 10MB
 *   allowedFileTypes={['pdf', 'docx', 'jpg', 'png']}
 *   maxFiles={5}
 * />
 * ```
 */
export const FormAttachmentPicker: React.FC<FormAttachmentPickerProps> = ({
  name,
  label,
  required,
  disabled,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes,
  maxFiles,
  uploadFile,
  onFileUploaded,
  onFileRemoved,
}) => {
  const { value, error, touched, onChange, onBlur } = useField(name);
  const formContext = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check if custom render is provided
  const customRender = formContext.renderCustomField(name);
  if (customRender !== null) {
    return <>{customRender}</>;
  }

  const attachments: AttachmentInfo[] = Array.isArray(value) ? value : [];

  // Mock upload function - in real SPFx, this would upload to SharePoint
  const mockUploadFile = async (file: File): Promise<AttachmentInfo> => {
    // Simulate upload progress
    setUploadProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      id: `mock-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file), // Create object URL for preview
      contentType: file.type,
      file: file,
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploading(true);

    try {
      const newAttachments: AttachmentInfo[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size
        if (file.size > maxSize) {
          setUploadError(
            `File "${file.name}" exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`
          );
          continue;
        }

        // Validate file type
        if (allowedFileTypes && allowedFileTypes.length > 0) {
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
            setUploadError(
              `File "${file.name}" is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`
            );
            continue;
          }
        }

        // Check max files limit
        if (maxFiles && attachments.length + newAttachments.length >= maxFiles) {
          setUploadError(`Maximum ${maxFiles} file(s) allowed`);
          break;
        }

        // Upload file (mock or real)
        const uploadFn = uploadFile || mockUploadFile;
        const uploadedFile = await uploadFn(file);
        newAttachments.push(uploadedFile);

        if (onFileUploaded) {
          onFileUploaded(uploadedFile);
        }
      }

      if (newAttachments.length > 0) {
        const updatedAttachments = [...attachments, ...newAttachments];
        onChange(updatedAttachments);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (attachment: AttachmentInfo) => {
    const updatedAttachments = attachments.filter((a) => {
      if (attachment.id) {
        return a.id !== attachment.id;
      }
      return a.name !== attachment.name || a.size !== attachment.size;
    });

    onChange(updatedAttachments);

    if (onFileRemoved) {
      onFileRemoved(attachment);
    }

    // Revoke object URL if it was created
    if (attachment.url && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return 'Image';
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('word') || contentType.includes('document')) return 'Word';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'Excel';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return 'PowerPoint';
    return 'Document';
  };

  const errorMessage = touched && error ? error.message : undefined;

  return (
    <div>
      {label && (
        <Label required={required} disabled={disabled}>
          {label}
        </Label>
      )}

      {uploadError && (
        <MessageBar
          messageBarType={MessageBarType.error}
          onDismiss={() => setUploadError(null)}
          style={{ marginBottom: 8 }}
        >
          {uploadError}
        </MessageBar>
      )}

      {uploading && (
        <div style={{ marginBottom: 8 }}>
          <ProgressIndicator
            label="Uploading..."
            percentComplete={uploadProgress / 100}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        onBlur={onBlur}
        disabled={disabled || uploading || (maxFiles ? attachments.length >= maxFiles : false)}
        style={{ display: 'none' }}
        accept={allowedFileTypes?.map((type) => `.${type}`).join(',')}
      />

      <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginBottom: 8 }}>
        <IconButton
          iconProps={{ iconName: 'Attach' }}
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || (maxFiles ? attachments.length >= maxFiles : false)}
        />
        <Text variant="small" style={{ alignSelf: 'center' }}>
          {maxFiles
            ? `${attachments.length}/${maxFiles} files`
            : `${attachments.length} file(s)`}
          {maxSize && ` • Max ${(maxSize / 1024 / 1024).toFixed(2)}MB per file`}
        </Text>
      </Stack>

      {attachments.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id || `${attachment.name}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                marginBottom: 4,
                backgroundColor: '#f3f2f1',
                borderRadius: 4,
                border: '1px solid #edebe9',
              }}
            >
              <IconButton
                iconProps={{ iconName: getFileIcon(attachment.contentType) }}
                title={getFileIcon(attachment.contentType)}
                disabled
                style={{ marginRight: 8, cursor: 'default' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  variant="medium"
                  style={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {attachment.name}
                </Text>
                <Text variant="small" style={{ color: '#666', marginTop: 2 }}>
                  {formatFileSize(attachment.size)} • {attachment.contentType || 'Unknown type'}
                </Text>
              </div>
              <IconButton
                iconProps={{ iconName: 'Cancel' }}
                title="Remove"
                onClick={() => handleRemove(attachment)}
                disabled={disabled}
                style={{ marginLeft: 8 }}
              />
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <Text variant="small" style={{ color: '#666', fontStyle: 'italic' }}>
          No attachments. Click the attach button to add files.
        </Text>
      )}

      {errorMessage && (
        <div style={{ color: 'rgb(164, 38, 44)', fontSize: 12, marginTop: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

