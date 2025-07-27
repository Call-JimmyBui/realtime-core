# Hạn chế của việc quản lý trạng thái WebSocket trong bộ nhớ (In-memory)

Tài liệu này mô tả các hạn chế hiện tại của việc quản lý trạng thái kết nối WebSocket (bao gồm người dùng đang hoạt động, phòng chat và client đã kết nối) bằng cách lưu trữ trực tiếp trong bộ nhớ của ứng dụng (in-memory).

Hiện tại, `EventsService` sử dụng các `Map` và `Set` (ví dụ: `connectedUsers`, `connectedClients`, `rooms`) để lưu trữ thông tin về các kết nối và phòng chat. Phương pháp này đơn giản và hiệu quả cho các môi trường phát triển và triển khai đơn lẻ, nhưng có những nhược điểm quan trọng khi hệ thống mở rộng.

## 1. Không Khả Năng Mở Rộng Theo Chiều Ngang (No Horizontal Scaling)

* **Vấn đề:** Khi bạn triển khai ứng dụng NestJS của mình trên nhiều instance (ví dụ: sử dụng Docker Compose với nhiều replica, Kubernetes, hoặc triển khai thủ công nhiều tiến trình/máy chủ), mỗi instance sẽ có bộ nhớ riêng biệt và không chia sẻ trạng thái với các instance khác.
* **Hậu quả:**
    * **Tin nhắn không đồng bộ:** Nếu người dùng A kết nối đến Server 1 và người dùng B kết nối đến Server 2, tin nhắn từ A gửi đến B (hoặc ngược lại) sẽ không được chuyển tiếp vì hai server không biết về nhau. Tin nhắn broadcast toàn cầu cũng sẽ chỉ được broadcast trong phạm vi của một server.
    * **Trạng thái người dùng không nhất quán:** Trạng thái "online" của người dùng A chỉ được biết đến bởi Server 1. Server 2 sẽ không thấy người dùng A đang online, dẫn đến thông tin sai lệch về danh sách người dùng.
    * **Quản lý phòng chat phức tạp:** Các phòng chat được tạo và duy trì riêng lẻ trên mỗi server. Người dùng trong cùng một phòng nhưng kết nối đến các server khác nhau sẽ không thể giao tiếp.

## 2. Không Bền Vững (No Durability)

* **Vấn đề:** Tất cả dữ liệu trạng thái kết nối (ai đang online, ai đang ở phòng nào) chỉ tồn tại trong RAM của tiến trình ứng dụng.
* **Hậu quả:**
    * **Mất dữ liệu khi khởi động lại:** Bất kỳ sự kiện nào khiến tiến trình ứng dụng khởi động lại (ví dụ: triển khai phiên bản mới, lỗi ứng dụng, bảo trì máy chủ) sẽ dẫn đến việc mất toàn bộ trạng thái kết nối hiện tại.
    * **Yêu cầu kết nối lại:** Tất cả người dùng đang kết nối sẽ bị ngắt kết nối và phải kết nối lại từ đầu, gây gián đoạn trải nghiệm người dùng.

## 3. Khó khăn trong quản lý phiên phức tạp

* **Vấn đề:** Việc theo dõi các phiên phức tạp, như xác thực người dùng, ủy quyền dựa trên vai trò, hoặc thông tin chi tiết về từng kết nối, trở nên khó khăn hơn khi chỉ dựa vào bộ nhớ cục bộ.
* **Hậu quả:** Có thể yêu cầu các cơ chế bổ sung để tái xác thực hoặc tái tạo trạng thái phiên sau khi kết nối lại, hoặc khi chuyển đổi giữa các server (nếu có load balancer).

---

## Khi nào cần nâng cấp?

Việc nâng cấp kiến trúc quản lý trạng thái WebSocket là cần thiết khi:

* **Yêu cầu khả năng mở rộng:** Cần hỗ trợ số lượng người dùng đồng thời lớn hơn yêu cầu của một server đơn lẻ.
* **Yêu cầu độ khả dụng cao (High Availability):** Cần đảm bảo dịch vụ không bị gián đoạn khi một server gặp sự cố hoặc được bảo trì.
* **Triển khai trên môi trường phân tán:** Sử dụng các công nghệ như Docker, Kubernetes để quản lý các microservices hoặc instance của ứng dụng.

## Giải pháp đề xuất để nâng cấp

Để khắc phục các hạn chế này, cần sử dụng một lớp trung gian để quản lý trạng thái và phân phối tin nhắn giữa các instance của ứng dụng. Các giải pháp phổ biến bao gồm:

* **Redis Pub/Sub với Socket.IO Adapter:** Đây là giải pháp tiêu chuẩn cho Socket.IO. Một Redis server đóng vai trò là "bộ não" trung tâm, nơi tất cả các server ứng dụng Socket.IO kết nối và trao đổi tin nhắn. Điều này đảm bảo tin nhắn được gửi đến tất cả các client, bất kể họ kết nối đến server nào.
* **Apache Kafka, RabbitMQ, hoặc các Message Broker khác:** Đối với các hệ thống phức tạp hơn cần hàng đợi tin nhắn bền vững và xử lý sự kiện mạnh mẽ.

`docs`: https://sapphire-transport-819.notion.site/H-ng-D-n-N-ng-C-p-H-Th-ng-Socket-IO-v-i-Redis-v-Kafka-23d27a51a45c8048a919d49792efb62b?source=copy_link