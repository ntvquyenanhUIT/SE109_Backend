# API Xác thực

## Đăng ký người dùng
- **URL:** `/api/auth/register`
- **Phương thức:** `POST`
- **Mô tả:** Đăng ký tài khoản người dùng mới
- **Yêu cầu xác thực:** Không

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user" // Mặc định là "user" nếu không được cung cấp
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "user",
    "profile_picture_url": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "message": "User registered successfully"
}
```

**Response lỗi:**
- 400: Thiếu trường bắt buộc
- 409: Tên người dùng hoặc email đã tồn tại
- 500: Lỗi máy chủ

## Đăng nhập
- **URL:** `/api/auth/login`
- **Phương thức:** `POST`
- **Mô tả:** Đăng nhập vào hệ thống
- **Yêu cầu xác thực:** Không

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 Success):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "profile_picture_url": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "message": "Login successful"
}
```

**Response lỗi:**
- 400: Thiếu email hoặc mật khẩu
- 401: Email hoặc mật khẩu không đúng
- 500: Lỗi máy chủ

## Đăng xuất
- **URL:** `/api/auth/logout`
- **Phương thức:** `POST`
- **Mô tả:** Đăng xuất khỏi hệ thống
- **Yêu cầu xác thực:** Không (nhưng thường được gọi khi đã đăng nhập)

**Request Body:** Không cần

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Lấy thông tin người dùng
- **URL:** `/api/auth/profile`
- **Phương thức:** `GET`
- **Mô tả:** Lấy thông tin cá nhân của người dùng đang đăng nhập
- **Yêu cầu xác thực:** Có

**Request Body:** Không cần

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "profile_picture_url": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 404: Không tìm thấy người dùng
- 500: Lỗi máy chủ

## Cập nhật thông tin người dùng
- **URL:** `/api/auth/profile`
- **Phương thức:** `PUT`
- **Mô tả:** Cập nhật thông tin cá nhân của người dùng đang đăng nhập
- **Yêu cầu xác thực:** Có

**Request Body:** (tất cả đều tùy chọn)
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Multipart Form Data:**
- `profilePicture` (tùy chọn): File hình ảnh đại diện

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "profile_picture_url": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "message": "Profile updated successfully"
}
```

**Response lỗi:**
- 401: Chưa xác thực
- 404: Không tìm thấy người dùng
- 500: Lỗi máy chủ