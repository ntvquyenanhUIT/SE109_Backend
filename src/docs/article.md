# API Bài viết

## Lấy danh sách bài viết
- **URL:** `/api/articles`
- **Phương thức:** `GET`
- **Mô tả:** Lấy danh sách bài viết với các tùy chọn lọc và phân trang
- **Yêu cầu xác thực:** Không

**Query Parameters:**
- `page` (số nguyên, mặc định: 1): Trang hiện tại
- `limit` (số nguyên, mặc định: 10): Số lượng bài viết mỗi trang
- `search` (string, tùy chọn): Từ khóa tìm kiếm trong tiêu đề, tóm tắt hoặc nội dung
- `category` (string, tùy chọn): Slug của danh mục
- `author` (string, tùy chọn): Tên người dùng của tác giả
- `sortBy` (string, mặc định: 'published_date'): Sắp xếp theo trường ('created_at', 'published_date', 'views', 'title')
- `sortOrder` (string, mặc định: 'DESC'): Thứ tự sắp xếp ('ASC', 'DESC')

**Response (200 Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "content": "string",
      "cover_image_url": "string",
      "author_id": "string",
      "category_id": "string",
      "views": "number",
      "published_date": "datetime",
      "created_at": "datetime",
      "updated_at": "datetime",
      "tags": ["string"],
      "author_name": "string",
      "category_name": "string"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

**Response lỗi:**
- 500: Lỗi máy chủ

## Lấy thông tin một bài viết
- **URL:** `/api/articles/:id`
- **Phương thức:** `GET`
- **Mô tả:** Lấy thông tin chi tiết của một bài viết theo ID
- **Yêu cầu xác thực:** Không

**URL Parameters:**
- `id`: ID của bài viết

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "summary": "string",
    "content": "string",
    "cover_image_url": "string",
    "author_id": "string",
    "category_id": "string",
    "views": "number",
    "published_date": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tags": ["string"],
    "author_name": "string",
    "category_name": "string"
  }
}
```

**Response lỗi:**
- 404: Không tìm thấy bài viết
- 500: Lỗi máy chủ

## Tạo bài viết mới
- **URL:** `/api/articles`
- **Phương thức:** `POST`
- **Mô tả:** Tạo một bài viết mới
- **Yêu cầu xác thực:** Có (Admin)

**Multipart Form Data:**
- `title` (string, bắt buộc): Tiêu đề bài viết
- `summary` (string, bắt buộc): Tóm tắt bài viết
- `content` (string, bắt buộc): Nội dung bài viết
- `category_id` (string, bắt buộc): ID của danh mục
- `published_date` (datetime, bắt buộc): Ngày xuất bản
- `tags` (string hoặc array, tùy chọn): Các thẻ gắn với bài viết
- `coverImage` (file, bắt buộc): Hình ảnh bìa bài viết

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "summary": "string",
    "content": "string",
    "cover_image_url": "string",
    "author_id": "string",
    "category_id": "string",
    "views": "number",
    "published_date": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tags": ["string"],
    "author_name": "string",
    "category_name": "string"
  },
  "message": "Article created successfully"
}
```

**Response lỗi:**
- 400: Thiếu hình ảnh bìa hoặc các trường bắt buộc
- 401: Chưa xác thực
- 403: Không có quyền admin
- 500: Lỗi máy chủ

## Cập nhật bài viết
- **URL:** `/api/articles/:id`
- **Phương thức:** `PUT`
- **Mô tả:** Cập nhật một bài viết theo ID
- **Yêu cầu xác thực:** Có (Admin)

**URL Parameters:**
- `id`: ID của bài viết

**Multipart Form Data:** (tất cả đều tùy chọn)
- `title`: Tiêu đề bài viết
- `summary`: Tóm tắt bài viết
- `content`: Nội dung bài viết
- `category_id`: ID của danh mục
- `published_date`: Ngày xuất bản
- `tags`: Các thẻ gắn với bài viết
- `coverImage`: Hình ảnh bìa bài viết mới

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "summary": "string",
    "content": "string",
    "cover_image_url": "string",
    "author_id": "string",
    "category_id": "string",
    "views": "number",
    "published_date": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime",
    "tags": ["string"],
    "author_name": "string",
    "category_name": "string"
  },
  "message": "Article updated successfully"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 404: Không tìm thấy bài viết
- 500: Lỗi máy chủ

## Xóa bài viết
- **URL:** `/api/articles/:id`
- **Phương thức:** `DELETE`
- **Mô tả:** Xóa một bài viết theo ID (xóa mềm)
- **Yêu cầu xác thực:** Có (Admin)

**URL Parameters:**
- `id`: ID của bài viết

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 404: Không tìm thấy bài viết
- 500: Lỗi máy chủ

## Lấy bài viết phổ biến
- **URL:** `/api/articles/popular`
- **Phương thức:** `GET`
- **Mô tả:** Lấy danh sách bài viết có lượt xem cao nhất
- **Yêu cầu xác thực:** Không

**Query Parameters:**
- `limit` (số nguyên, mặc định: 5): Số lượng bài viết trả về

**Response (200 Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "content": "string",
      "cover_image_url": "string",
      "author_id": "string",
      "category_id": "string",
      "views": "number",
      "published_date": "datetime",
      "created_at": "datetime",
      "updated_at": "datetime",
      "tags": ["string"],
      "author_name": "string",
      "category_name": "string"
    }
  ]
}
```

**Response lỗi:**
- 500: Lỗi máy chủ

## Lấy bài viết mới nhất
- **URL:** `/api/articles/recent`
- **Phương thức:** `GET`
- **Mô tả:** Lấy danh sách bài viết mới nhất
- **Yêu cầu xác thực:** Không

**Query Parameters:**
- `limit` (số nguyên, mặc định: 5): Số lượng bài viết trả về

**Response (200 Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "content": "string",
      "cover_image_url": "string",
      "author_id": "string",
      "category_id": "string",
      "views": "number",
      "published_date": "datetime",
      "created_at": "datetime",
      "updated_at": "datetime",
      "tags": ["string"],
      "author_name": "string",
      "category_name": "string"
    }
  ]
}
```

**Response lỗi:**
- 500: Lỗi máy chủ