# API Bình luận

## Lấy bình luận theo bài viết
- **URL:** `/api/comments/article/:articleId`
- **Phương thức:** `GET`
- **Mô tả:** Lấy tất cả bình luận của một bài viết
- **Yêu cầu xác thực:** Không

**URL Parameters:**
- `articleId`: ID của bài viết

**Response (200 Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "article_id": "string",
      "author_id": "string",
      "content": "string",
      "likes": "number",
      "created_at": "datetime",
      "updated_at": "datetime",
      "author_name": "string"
    }
  ]
}
```

**Response lỗi:**
- 500: Lỗi máy chủ

## Tạo bình luận mới
- **URL:** `/api/comments`
- **Phương thức:** `POST`
- **Mô tả:** Tạo một bình luận mới cho bài viết
- **Yêu cầu xác thực:** Có

**Request Body:**
```json
{
  "article_id": "string",
  "content": "string"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "article_id": "string",
    "author_id": "string",
    "content": "string",
    "likes": "number",
    "created_at": "datetime",
    "updated_at": "datetime",
    "author_name": "string"
  },
  "message": "Comment created successfully"
}
```

**Response lỗi:**
- 400: Nội dung bình luận không phù hợp hoặc thiếu thông tin bắt buộc
- 401: Chưa xác thực
- 500: Lỗi máy chủ

## Cập nhật bình luận
- **URL:** `/api/comments/:id`
- **Phương thức:** `PUT`
- **Mô tả:** Cập nhật nội dung của một bình luận
- **Yêu cầu xác thực:** Có (Người tạo bình luận hoặc Admin)

**URL Parameters:**
- `id`: ID của bình luận

**Request Body:**
```json
{
  "content": "string"
}
```

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "article_id": "string",
    "author_id": "string",
    "content": "string",
    "likes": "number",
    "created_at": "datetime",
    "updated_at": "datetime",
    "author_name": "string"
  },
  "message": "Comment updated successfully"
}
```

**Response lỗi:**
- 400: Nội dung bình luận không phù hợp
- 401: Chưa xác thực
- 404: Không tìm thấy bình luận hoặc không có quyền chỉnh sửa
- 500: Lỗi máy chủ

## Xóa bình luận
- **URL:** `/api/comments/:id`
- **Phương thức:** `DELETE`
- **Mô tả:** Xóa một bình luận (xóa mềm)
- **Yêu cầu xác thực:** Có (Người tạo bình luận hoặc Admin)

**URL Parameters:**
- `id`: ID của bình luận

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 404: Không tìm thấy bình luận hoặc không có quyền xóa
- 500: Lỗi máy chủ

## Thích bình luận
- **URL:** `/api/comments/:id/like`
- **Phương thức:** `POST`
- **Mô tả:** Tăng số lượt thích cho một bình luận
- **Yêu cầu xác thực:** Có

**URL Parameters:**
- `id`: ID của bình luận

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "article_id": "string",
    "author_id": "string",
    "content": "string",
    "likes": "number",
    "created_at": "datetime",
    "updated_at": "datetime",
    "author_name": "string"
  },
  "message": "Comment liked successfully"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 404: Không tìm thấy bình luận
- 500: Lỗi máy chủ