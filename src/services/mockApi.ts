import { MockApiConfig, ApiResponse } from '../types';

/**
 * Mock API Service for testing without SharePoint tenant
 * This service simulates SharePoint API calls and can be easily replaced
 * with real SPFx API calls when you have access to a tenant
 */
export class MockApiService {
  private config: MockApiConfig;

  constructor(config: MockApiConfig = {}) {
    this.config = {
      delay: config.delay ?? 500,
      shouldFail: config.shouldFail ?? false,
      failRate: config.failRate ?? 0,
    };
  }

  /**
   * Simulate API delay
   */
  private async delay(ms: number = this.config.delay!): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Simulate random failures
   */
  private shouldFail(): boolean {
    if (this.config.shouldFail) return true;
    if (this.config.failRate && Math.random() < this.config.failRate) return true;
    return false;
  }

  /**
   * Mock GET request - simulates fetching list items
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    // endpoint is used in the logic below
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Network error: Failed to fetch data',
        statusCode: 500,
      };
    }

    // Simulate different endpoints
    if (endpoint.includes('/lists/')) {
      // Extract list name from endpoint
      const listNameMatch = endpoint.match(/\/lists\/([^\/]+)/);
      const listName = listNameMatch ? listNameMatch[1] : 'DefaultList';
      
      return {
        success: true,
        data: this.mockListItems(listName) as T,
        statusCode: 200,
      };
    }

    if (endpoint.includes('/users/')) {
      return {
        success: true,
        data: this.mockUsers() as T,
        statusCode: 200,
      };
    }

    return {
      success: true,
      data: {} as T,
      statusCode: 200,
    };
  }

  /**
   * Mock POST request - simulates creating list item
   */
  async post<T = any>(_endpoint: string, data: any): Promise<ApiResponse<T>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Server error: Failed to create item',
        statusCode: 500,
      };
    }

    // Simulate validation errors
    if (data && !data.Title) {
      return {
        success: false,
        error: 'Title is required',
        statusCode: 400,
      };
    }

    return {
      success: true,
      data: {
        ...data,
        Id: Math.floor(Math.random() * 10000),
        Created: new Date().toISOString(),
        Modified: new Date().toISOString(),
      } as T,
      statusCode: 201,
    };
  }

  /**
   * Mock PATCH/PUT request - simulates updating list item
   */
  async patch<T = any>(_endpoint: string, data: any): Promise<ApiResponse<T>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Server error: Failed to update item',
        statusCode: 500,
      };
    }

    return {
      success: true,
      data: {
        ...data,
        Modified: new Date().toISOString(),
      } as T,
      statusCode: 200,
    };
  }

  /**
   * Mock DELETE request - simulates deleting list item
   */
  async delete(_endpoint: string): Promise<ApiResponse> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Server error: Failed to delete item',
        statusCode: 500,
      };
    }

    return {
      success: true,
      statusCode: 200,
    };
  }

  /**
   * Add new list item - simulates creating a new item
   */
  async addListItem(listName: string, data: any, _listUrl?: string): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to create list item',
        statusCode: 500,
      };
    }

    // Simulate validation errors
    if (data && !data.Title && !data.title) {
      return {
        success: false,
        error: 'Title is required',
        statusCode: 400,
      };
    }

    // Mock created item
    const newItem: any = {
      Id: Math.floor(Math.random() * 10000) + 100,
      ...data,
      Created: new Date().toISOString(),
      Modified: new Date().toISOString(),
      Author: {
        Id: 1,
        Title: 'Current User',
        Email: 'user@example.com',
      },
      Editor: {
        Id: 1,
        Title: 'Current User',
        Email: 'user@example.com',
      },
    };

    return {
      success: true,
      data: newItem,
      statusCode: 201,
    };
  }

  /**
   * Update list item - simulates updating an existing item
   */
  async updateListItem(listName: string, itemId: number, data: any, _listUrl?: string): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to update list item',
        statusCode: 500,
      };
    }

    // Mock updated item
    const updatedItem: any = {
      Id: itemId,
      ...data,
      Modified: new Date().toISOString(),
      Editor: {
        Id: 1,
        Title: 'Current User',
        Email: 'user@example.com',
      },
    };

    return {
      success: true,
      data: updatedItem,
      statusCode: 200,
    };
  }

  /**
   * Get list item by ID - simulates fetching a specific list item
   */
  async getListItem(listName: string, itemId: number, _listUrl?: string): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch list item',
        statusCode: 500,
      };
    }

    // Mock list item data
    const mockItem: any = {
      Id: itemId,
      Title: `Sample Item ${itemId}`,
      Description: `This is a sample item from ${listName}`,
      Status: 'Active',
      AssignedTo: {
        Id: 1,
        Title: 'John Doe',
        Email: 'john.doe@example.com',
      },
      Category: {
        Id: 1,
        Title: 'Technology',
      },
      StartDate: new Date().toISOString(),
      Created: new Date().toISOString(),
      Modified: new Date().toISOString(),
      Author: {
        Id: 1,
        Title: 'System Account',
        Email: 'system@example.com',
      },
      Editor: {
        Id: 1,
        Title: 'System Account',
        Email: 'system@example.com',
      },
    };

    // Add list-specific fields based on list name
    if (listName.toLowerCase().includes('task')) {
      mockItem.DueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      mockItem.Priority = 'High';
      mockItem.PercentComplete = 0;
    }

    if (listName.toLowerCase().includes('document')) {
      mockItem.FileLeafRef = `document-${itemId}.docx`;
      mockItem.FileSystemObjectType = 0;
    }

    return {
      success: true,
      data: mockItem,
      statusCode: 200,
    };
  }

  /**
   * Mock list items data
   */
  private mockListItems(listName?: string) {
    // Generate different mock data based on list name
    const baseItems = [
      {
        Id: 1,
        Title: 'Sample Item 1',
        Description: 'This is a sample item',
        Status: 'Active',
        Created: new Date().toISOString(),
      },
      {
        Id: 2,
        Title: 'Sample Item 2',
        Description: 'Another sample item',
        Status: 'Pending',
        Created: new Date().toISOString(),
      },
    ];

    // Customize based on list name
    if (listName?.toLowerCase().includes('categor')) {
      return {
        value: [
          { Id: 1, Title: 'Technology' },
          { Id: 2, Title: 'Business' },
          { Id: 3, Title: 'Marketing' },
          { Id: 4, Title: 'Sales' },
          { Id: 5, Title: 'Support' },
        ],
      };
    }

    if (listName?.toLowerCase().includes('tag')) {
      return {
        value: [
          { Id: 1, Title: 'Important' },
          { Id: 2, Title: 'Urgent' },
          { Id: 3, Title: 'Review' },
          { Id: 4, Title: 'Approved' },
        ],
      };
    }

    return {
      value: baseItems,
    };
  }

  /**
   * Get all items from a list - for lookup fields
   */
  async getListItems(listName: string, _listUrl?: string): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch list items',
        statusCode: 500,
      };
    }

    const items = this.mockListItems(listName);
    return {
      success: true,
      data: items.value,
      statusCode: 200,
    };
  }

  /**
   * Upload file attachment to a list item
   */
  async uploadFile(
    listName: string,
    itemId: number,
    file: File,
    fileName?: string,
    _listUrl?: string
  ): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to upload file',
        statusCode: 500,
      };
    }

    // Simulate file upload
    const uploadedFileName = fileName || file.name;
    const fileInfo = {
      FileName: uploadedFileName,
      ServerRelativeUrl: `/Lists/${listName}/Attachments/${itemId}/${uploadedFileName}`,
      Length: file.size,
      ContentType: file.type || 'application/octet-stream',
    };

    return {
      success: true,
      data: fileInfo,
      statusCode: 200,
    };
  }

  /**
   * Delete file attachment from a list item
   */
  async deleteFile(
    listName: string,
    itemId: number,
    fileName: string,
    _listUrl?: string
  ): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to delete file',
        statusCode: 500,
      };
    }

    return {
      success: true,
      data: { deleted: true, fileName },
      statusCode: 200,
    };
  }

  /**
   * Get field metadata from SharePoint list
   */
  async getFieldMetadata(
    listName: string,
    fieldName: string,
    _listUrl?: string
  ): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch field metadata',
        statusCode: 500,
      };
    }

    // Mock field metadata based on field name
    const mockMetadata: any = {
      Title: {
        InternalName: 'Title',
        Title: 'Title',
        Type: 'Text',
        Required: true,
        ReadOnlyField: false,
        MaxLength: 255,
      },
      Category: {
        InternalName: 'Category',
        Title: 'Category',
        Type: 'Lookup',
        Required: false,
        ReadOnlyField: false,
        LookupListName: 'Categories',
        LookupFieldName: 'Title',
      },
      Status: {
        InternalName: 'Status',
        Title: 'Status',
        Type: 'Choice',
        Required: false,
        ReadOnlyField: false,
        Choices: ['Active', 'Inactive', 'Pending'],
      },
      Description: {
        InternalName: 'Description',
        Title: 'Description',
        Type: 'Note',
        Required: false,
        ReadOnlyField: false,
      },
      StartDate: {
        InternalName: 'StartDate',
        Title: 'Start Date',
        Type: 'DateTime',
        Required: false,
        ReadOnlyField: false,
      },
      IsActive: {
        InternalName: 'IsActive',
        Title: 'Is Active',
        Type: 'Boolean',
        Required: false,
        ReadOnlyField: false,
      },
      AssignedTo: {
        InternalName: 'AssignedTo',
        Title: 'Assigned To',
        Type: 'User',
        Required: false,
        ReadOnlyField: false,
      },
      Attachments: {
        InternalName: 'Attachments',
        Title: 'Attachments',
        Type: 'Attachment',
        Required: false,
        ReadOnlyField: false,
      },
    };

    const metadata = mockMetadata[fieldName] || {
      InternalName: fieldName,
      Title: fieldName,
      Type: 'Text',
      Required: false,
      ReadOnlyField: false,
    };

    return {
      success: true,
      data: metadata,
      statusCode: 200,
    };
  }

  /**
   * Get all fields metadata from SharePoint list
   */
  async getListFields(
    listName: string,
    _listUrl?: string
  ): Promise<ApiResponse<any>> {
    await this.delay();

    if (this.shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch list fields',
        statusCode: 500,
      };
    }

    // Mock all fields
    const fields = [
      {
        InternalName: 'Title',
        Title: 'Title',
        Type: 'Text',
        Required: true,
        ReadOnlyField: false,
        MaxLength: 255,
      },
      {
        InternalName: 'Category',
        Title: 'Category',
        Type: 'Lookup',
        Required: false,
        ReadOnlyField: false,
        LookupListName: 'Categories',
        LookupFieldName: 'Title',
      },
      {
        InternalName: 'Status',
        Title: 'Status',
        Type: 'Choice',
        Required: false,
        ReadOnlyField: false,
        Choices: ['Active', 'Inactive', 'Pending'],
      },
    ];

    return {
      success: true,
      data: fields,
      statusCode: 200,
    };
  }

  /**
   * Mock users data
   */
  private mockUsers() {
    return {
      value: [
        {
          Id: 1,
          Title: 'John Doe',
          Email: 'john.doe@example.com',
          LoginName: 'i:0#.f|membership|john.doe@example.com',
        },
        {
          Id: 2,
          Title: 'Jane Smith',
          Email: 'jane.smith@example.com',
          LoginName: 'i:0#.f|membership|jane.smith@example.com',
        },
      ],
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MockApiConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default mock API instance
 */
export const mockApi = new MockApiService();

/**
 * Helper function to create SPFx-compatible API service
 * Replace this with your actual SPFx API calls when you have a tenant
 * 
 * Example:
 * ```typescript
 * import { sp } from "@pnp/sp";
 * 
 * export const spfxApi = {
 *   get: async (endpoint: string) => {
 *     const response = await sp.web.get();
 *     return { success: true, data: response };
 *   },
 *   post: async (endpoint: string, data: any) => {
 *     const response = await sp.web.lists.getByTitle("YourList").items.add(data);
 *     return { success: true, data: response.data };
 *   },
 *   // ... other methods
 * };
 * ```
 */
export const createSpfxApiService = () => {
  // This is a placeholder - replace with actual SPFx API calls
  // when you have access to a tenant
  return mockApi;
};

