export interface AttachmentInfo {
  id?: string;
  name: string;
  size: number;
  url?: string;
  contentType: string;
  file?: File;
}

export interface FormAttachmentPickerProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  maxSize?: number;
  allowedFileTypes?: string[];
  maxFiles?: number;
  uploadFile?: (file: File) => Promise<AttachmentInfo>;
  onFileUploaded?: (attachment: AttachmentInfo) => void;
  onFileRemoved?: (attachment: AttachmentInfo) => void;
}

