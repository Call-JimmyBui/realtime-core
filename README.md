# Realtime Socket.IO Chat with NestJS

## 🧩 Giới Thiệu

Đây là dự án backend được xây dựng với [NestJS](https://nestjs.com/) và [Socket.IO](https://socket.io/) để cung cấp khả năng giao tiếp thời gian thực. Dự án này phục vụ như một ví dụ hoặc nền tảng để xây dựng các ứng dụng yêu cầu cập nhật tức thì và tương tác hai chiều giữa server và client.

## ⚙️ Các Kỹ Năng và Tính Năng Chính của Socket.IO

### 1. **Giao Tiếp Thời Gian Thực (Real-time Communication)**
Socket.IO cho phép máy chủ đẩy dữ liệu đến client ngay lập tức khi có sự kiện xảy ra.

### 2. **Giao Tiếp Hai Chiều (Bidirectional Communication)**
Cả server và client đều có thể gửi và nhận sự kiện lẫn nhau một cách dễ dàng.

### 3. **Tự Động Kết Nối Lại và Xử Lý Kết Nối (Automatic Reconnection & Connection Management)**
Giúp ứng dụng ổn định hơn khi client bị rớt kết nối tạm thời.

### 4. **Phòng và Namespaces (Rooms & Namespaces)**
- **Rooms:** Nhóm các client vào từng phòng cụ thể.
- **Namespaces:** Phân chia kênh kết nối socket thành nhiều mảng chức năng riêng biệt.

### 5. **Xác Thực và Ủy Quyền (Authentication & Authorization)**
Dễ dàng tích hợp JWT hoặc các hệ thống auth để bảo mật socket.

### 6. **Fallback từ WebSocket sang Long Polling**
Đảm bảo hoạt động ổn định trên nhiều môi trường mạng.

### 7. **Xử Lý Sự Kiện Linh Hoạt (Flexible Event Handling)**
Cho phép định nghĩa các sự kiện tùy chỉnh (`emit`, `on`) với payload.

### 8. **Tích Hợp NestJS (NestJS Integration)**
Tận dụng các decorator, dependency injection, pipe... khi dùng với `@nestjs/websockets`.


## 📚 Development

### 🚧 Hạn chế của việc quản lý trạng thái WebSocket trong bộ nhớ (In-memory)

Hiện tại hệ thống chỉ giả lập nhằm mục đích tiếp cận và học socket, đang sử dụng các `Map` và `Set` để quản lý trạng thái kết nối (`connectedUsers`, `rooms`, v.v). Điều này hoạt động tốt trong môi trường đơn giản để thử nghiệm, nhưng:

- **Chỉ mô hình chứ không thực tê**: các dữ liệu đều tạm thời
- **Không bền vững**: Khi server restart, mất toàn bộ kết nối và trạng thái.
- **Khó tích hợp auth/session** phức tạp hoặc load balancing.
- **Không thể mở rộng theo chiều ngang**: Nhiều instance không chia sẻ được trạng thái.

📄 Chi tiết: [In-memory Limitations](./docs/websocket_in_memory_limitations.md)


### 🚀 Nâng cấp kiến trúc với Redis hoặc Kafka
**→ Cần Redis Pub/Sub hoặc Kafka làm tầng trung gian phân phối sự kiện.**

📄 Xem hướng dẫn:  
- [Hướng Dẫn Trên Notion (nâng cao)](https://sapphire-transport-819.notion.site/H-ng-D-n-N-ng-C-p-H-Th-ng-Socket-IO-v-i-Redis-v-Kafka-23d27a51a45c8048a919d49792efb62b?source=copy_link)
