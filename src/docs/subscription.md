# API Đăng ký nhận thông báo

## Đăng ký nhận bản tin
- **URL:** `/api/subscriptions/subscribe`
- **Phương thức:** `POST`
- **Mô tả:** Đăng ký nhận thông báo về bài viết mới qua email
- **Yêu cầu xác thực:** Có

**Request Body:** Không cần

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "user_id": "string",
    "created_at": "datetime",
    "status": "active"
  },
  "message": "Successfully subscribed to newsletter"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 500: Lỗi máy chủ

## Hủy đăng ký
- **URL:** `/api/subscriptions/unsubscribe`
- **Phương thức:** `DELETE`
- **Mô tả:** Hủy đăng ký nhận thông báo qua email
- **Yêu cầu xác thực:** Có

**Request Body:** Không cần

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 404: Không tìm thấy đăng ký
- 500: Lỗi máy chủ

## Kiểm tra trạng thái đăng ký
- **URL:** `/api/subscriptions/status`
- **Phương thức:** `GET`
- **Mô tả:** Kiểm tra xem người dùng đã đăng ký nhận thông báo chưa
- **Yêu cầu xác thực:** Có

**Request Body:** Không cần

**Response (200 Success):**
```json
{
  "success": true,
  "isSubscribed": "boolean"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 500: Lỗi máy chủ

## Gửi bản tin
- **URL:** `/api/subscriptions/send-notification`
- **Phương thức:** `POST`
- **Mô tả:** Gửi email thông báo về bài viết mới cho tất cả người đăng ký
- **Yêu cầu xác thực:** Có (Admin)

**Request Body:** Không cần (sử dụng giá trị mặc định)
- Tiêu đề email mặc định: "Football News: [số lượng] New Articles This Week"
- Khung thời gian mặc định: 7 ngày

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Newsletter notification process has been started"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 403: Không có quyền admin
- 500: Lỗi máy chủ

**Thông tin thêm:**
- Email được gửi có định dạng HTML với danh sách các bài viết mới, tiêu đề và phần tóm tắt
- Người dùng có thể click vào tiêu đề bài viết để đọc trực tiếp từ email
- Mỗi email chứa liên kết đến trang web chính và tùy chọn hủy đăng ký
- Việc gửi email được thực hiện bất đồng bộ sau khi phản hồi HTTP đã được trả về
- Hệ thống gửi email theo lô (batch) với kích thước tối đa 50 email mỗi lô