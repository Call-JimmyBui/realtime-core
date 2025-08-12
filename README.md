## Cài đặt

Yêu cầu:

- Node.js (>= 18)
- MongoDB
- Redis
- pnpm


link postman: https://grey-desert-64859.postman.co/workspace/My-Workspace~fbe9e114-66f3-4a82-8997-9bdeff159c8d/collection/33818687-11bb55d5-4b61-4f96-a5f9-57970f5f4dde?action=share&creator=33818687

Để cài đặt và chạy dự án:

```bash
# Clone repository
git clone https://github.com/Call-JimmyBui/bigcode_demo.git
cd nestjs-auth-service

# Cài đặt dependencies
pnpm install

# Tạo file .env
# Cấu hình các biến môi trường trong file .env

# Khởi động MongoDB và Redis (sử dụng Docker)
docker-compose up -d

# Chạy ứng dụng trong môi trường phát triển
pnpm run start:dev

# Seed list products
pnpm run seed:products

```

## Tính năng

- Đăng ký người dùng với xác thực email
- Đăng nhập với JWT (JSON Web Tokens)
- Quản lý session
- Làm mới token (Refresh Token)
- Blacklist token để vô hiệu hóa khi đăng xuất
- Phân quyền người dùng (Role-based Access Control)
- Quản lý đa phiên đăng nhập

## Luồng xác thực

### Đăng ký (Register)

- Người dùng gửi thông tin đăng ký (email, mật khẩu)
- Hệ thống kiểm tra email đã tồn tại chưa
- Tạo verification token và gửi email xác thực
- Lưu thông tin tạm thời vào Redis với thời gian hết hạn
- Người dùng nhấp vào link xác thực trong email
- Hệ thống xác thực token và kích hoạt tài khoản

### Đăng nhập (Login)

- Người dùng gửi thông tin đăng nhập (email, mật khẩu)
- Hệ thống xác thực thông tin
- Tạo session mới
- Tạo bộ token (access token và refresh token)
- Trả về thông tin token cho người dùng

### Làm mới Token (Refresh Token)

- Client gửi refresh token
- Hệ thống xác thực refresh token
- Kiểm tra token có trong blacklist không
- Tạo access token mới
- Cập nhật hash cho session
- Trả về access token mới

### Đăng xuất (Logout)

- Client gửi request đăng xuất kèm token
- Thêm token vào blacklist
- Xóa session

## API Endpoints

Dự án cung cấp các API endpoints sau:

```tsx
POST /auth/register - Đăng ký tài khoản mới
GET /auth/verify/email?token={token} - Xác thực email
POST /auth/login - Đăng nhập
POST /auth/refresh - Làm mới token
POST /auth/logout - Đăng xuất

```

### Chi tiết API

### Đăng ký

```tsx
// Request
POST /auth/register
{
  "email": "example@example.com",
  "password": "password123"
}

// Response
{
  "accountId": "60d21b4667d0d8992e610c85"
}

```

### Đăng nhập

```tsx
// Request
POST /auth/login
{
  "email": "example@example.com",
  "password": "password123"
}

// Response
{
  "userId": "60d21b4667d0d8992e610c85",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1623868149197
}

```

### Refresh Token

```tsx
// Request
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1623868149197
}

```

## Cấu hình

Cấu hình được quản lý qua ConfigService. Các thiết lập cần được định nghĩa trong file .env:

```
# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
JWT_CONFIRM_EMAIL_SECRET=your_email_secret
JWT_CONFIRM_EMAIL_EXPIRES=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/auth

# Email Configuration
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASSWORD=your_email_password
MAIL_FROM=no-reply@example.com

# Application
APP_URL=http://localhost:3000

```

## Cấu trúc Database

Dự án sử dụng MongoDB với các schemas sau:

### User

```tsx
interface User {
  _id: ObjectId;
  authProviderId: ObjectId;
  email: string;
  roles: ObjectId[];
  isActive: boolean;
  isVerify: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

```

### AuthProvider

```tsx
interface AuthProvider {
  _id: ObjectId;
  email: string;
  password?: string;
  providerType: AuthProviderType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

```

### Role

```tsx
interface Role {
  _id: ObjectId;
  rolename: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

```

### Session

```tsx
interface Session {
  _id: ObjectId;
  user: ObjectId;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

```