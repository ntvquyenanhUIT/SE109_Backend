# API Phân tích

## Lấy tổng quan số liệu
- **URL:** `/api/analytics/summary`
- **Phương thức:** `GET`
- **Mô tả:** Lấy tổng quan về số liệu hệ thống
- **Yêu cầu xác thực:** Có (Admin)

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "totalArticles": "number",
    "totalVisitors": "number",
    "totalViews": "number",
    "subscribedUsers": "number"
  }
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 500: Lỗi máy chủ

## Lấy thống kê bài viết theo danh mục
- **URL:** `/api/analytics/articles-by-category`
- **Phương thức:** `GET`
- **Mô tả:** Thống kê số lượng bài viết theo từng danh mục
- **Yêu cầu xác thực:** Có (Admin)

**Response (200 Success):**
```json
{
  "success": true,
  "data": [
    {
      "category_name": "string",
      "count": "number"
    }
  ]
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 500: Lỗi máy chủ

## Lấy bài viết có lượt xem cao nhất
- **URL:** `/api/analytics/most-viewed-articles`
- **Phương thức:** `GET`
- **Mô tả:** Lấy danh sách bài viết có lượt xem cao nhất
- **Yêu cầu xác thực:** Có (Admin)

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
      "views": "number"
    }
  ]
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 500: Lỗi máy chủ

## Xem xu hướng lượt truy cập
- **URL:** `/api/analytics/visitor-trends`
- **Phương thức:** `GET`
- **Mô tả:** Xem số liệu về xu hướng truy cập theo tháng
- **Yêu cầu xác thực:** Có (Admin)

**Query Parameters:**
- `year` (số nguyên, mặc định: năm hiện tại): Năm muốn xem
- `month` (số nguyên, mặc định: tháng hiện tại): Tháng muốn xem

**Response (200 Success):**
```json
{
  "success": true,
  "data": [
    {
      "week_start": "date",
      "total_visitors": "number"
    }
  ]
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 500: Lỗi máy chủ

## Ghi nhận lượt truy cập
- **URL:** `/api/analytics/record-visit`
- **Phương thức:** `POST`
- **Mô tả:** Ghi nhận lượt truy cập vào hệ thống
- **Yêu cầu xác thực:** Không

**Request Body:** (tùy chọn)
```json
{
  "date": "YYYY-MM-DD" // Mặc định là ngày hiện tại
}
```

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Visit recorded successfully"
}
```

**Response lỗi:**
- 500: Lỗi máy chủ