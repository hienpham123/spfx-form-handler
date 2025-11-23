# Real World Usage Check

## ✅ Đã kiểm tra và đảm bảo:

### 1. **FormProvider - Load Item Data**
- ✅ Sử dụng `apiService.getItem()` từ config
- ✅ Chỉ fallback về `mockApi` nếu không có custom `apiService`
- ✅ Khi có `apiService` với `getItem`, sẽ dùng API thật

**Code:**
```tsx
const customApiService = config.apiService || config.listConfig?.apiService;
const apiService = {
  getItem: (customApiService?.getItem 
    ? customApiService.getItem  // ✅ Dùng API thật nếu có
    : async (...) => await mockApi.getListItem(...) // ⚠️ Chỉ fallback nếu không có
  ),
  // ... other methods
};
```

### 2. **FormProvider - Save Item (Add/Update)**
- ✅ Sử dụng `apiService.addItem()` và `apiService.updateItem()` từ config
- ✅ Chỉ fallback về `mockApi` nếu không có custom `apiService`
- ✅ Khi có `apiService`, sẽ dùng API thật

**Code:**
```tsx
// Add new item
const response = await apiService.addItem(listName, spData, listUrl);
// Update existing item
const response = await apiService.updateItem(listName, itemId, spData, listUrl);
```

### 3. **FormProvider - Upload Attachments**
- ✅ Sử dụng `apiService.uploadFile()` từ config
- ✅ Chỉ fallback về `mockApi` nếu không có custom `apiService`
- ✅ Khi có `apiService`, sẽ dùng API thật

**Code:**
```tsx
const uploadPromise = apiService.uploadFile(
  listName,
  savedItemId,
  attachment.file,
  attachment.name,
  listUrl
);
```

### 4. **FormLookup - Load Options**
- ✅ Sử dụng `apiService.getListItems()` từ form context
- ✅ Chỉ fallback về `mockApi` nếu không có custom `apiService`
- ✅ Khi có `apiService`, sẽ dùng API thật

**Code:**
```tsx
const apiService = formContext.apiService; // ✅ Lấy từ context
if (apiService && 'getListItems' in apiService && apiService.getListItems) {
  response = await apiService.getListItems(lookupList, targetListUrl);
}
```

## 📝 Cách sử dụng trong dự án thực tế:

### Minimal Setup (Chỉ cần listName, id, endpoint):

```tsx
import { sp } from '@pnp/sp';
import { FormProvider } from 'spfx-form-handler';

// Initialize SPFx
sp.setup({
  spfxContext: context, // Your SPFx context
});

<FormProvider
  config={{
    id: 1, // Item ID (0 = new, > 0 = edit)
    listName: 'Projects', // ✅ List name
    listUrl: 'https://hieho.sharepoint.com/sites/apps', // ✅ Endpoint
    apiService: {
      // ✅ Real API - sẽ được dùng thay vì mockApi
      getItem: async (listName, itemId, listUrl) => {
        const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
        const item = await web.lists.getByTitle(listName).items.getById(itemId).get();
        return { success: true, data: item };
      },
      addItem: async (listName, data, listUrl) => {
        const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
        const result = await web.lists.getByTitle(listName).items.add(data);
        return { success: true, data: result.data };
      },
      updateItem: async (listName, itemId, data, listUrl) => {
        const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
        await web.lists.getByTitle(listName).items.getById(itemId).update(data);
        const updated = await web.lists.getByTitle(listName).items.getById(itemId).get();
        return { success: true, data: updated };
      },
      getListItems: async (listName, listUrl) => {
        const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
        const items = await web.lists.getByTitle(listName).items.select('Id', 'Title').get();
        return { success: true, data: items };
      },
      uploadFile: async (listName, itemId, file, fileName, listUrl) => {
        const web = listUrl ? sp.site.openWeb(listUrl) : sp.web;
        const attachmentFolder = web
          .lists.getByTitle(listName)
          .items.getById(itemId)
          .attachmentFiles;
        const arrayBuffer = await file.arrayBuffer();
        const result = await attachmentFolder.add(fileName || file.name, arrayBuffer);
        return { success: true, data: result.data };
      },
    },
    autoSave: true, // ✅ Tự động save
  }}
>
  {/* Your form */}
</FormProvider>
```

## ⚠️ Lưu ý:

1. **Nếu không có `apiService`**: Code sẽ fallback về `mockApi` (chỉ dùng cho demo/testing)
2. **Nếu có `apiService`**: Code sẽ dùng API thật từ `apiService` bạn cung cấp
3. **FormLookup**: Cần `apiService.getListItems()` để load options từ SharePoint list
4. **Attachments**: Cần `apiService.uploadFile()` để upload files

## ✅ Kết luận:

**Code đã được thiết kế để:**
- ✅ Ưu tiên sử dụng `apiService` từ config (API thật)
- ✅ Chỉ fallback về `mockApi` nếu không có `apiService` (cho demo/testing)
- ✅ Khi bạn cung cấp `apiService` với `listName`, `id`, `endpoint`, code sẽ hoàn toàn dùng API thật
- ✅ Không có hardcode mock data trong logic chính

**Để đảm bảo 100% dùng API thật:**
- Luôn cung cấp `apiService` trong config
- Không để `apiService` undefined hoặc null

