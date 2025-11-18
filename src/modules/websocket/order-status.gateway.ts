import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001', // chỉ FE port 3001 được connect
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class OrderStatusGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('WS client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('WS client disconnected', client.id);
  }

  // Client gọi event này để join room theo orderNumber
  @SubscribeMessage('joinOrder')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderNumber: string },
  ) {
    const { orderNumber } = payload || {};
    if (!orderNumber) return;
    const room = this.getOrderRoom(orderNumber);
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
    return { joined: room };
  }

  // Helper tạo tên room nhất quán
  private getOrderRoom(orderNumber: string) {
    return `order_${orderNumber}`;
  }

  // Hàm để các service khác gọi khi cần broadcast
  emitOrderStatusUpdate(orderNumber: string, payload: any) {
    const room = this.getOrderRoom(orderNumber);
    // Emit tới room (chỉ client đã join room sẽ nhận)
    this.server.to(room).emit('orderStatusUpdated', payload);
    // Nếu muốn broadcast toàn server: this.server.emit('orderStatusUpdated', payload)
  }

  // Option: emit cho merchant (ví dụ merchant_{merchantId})
  emitToMerchant(merchantId: number | string, event: string, payload: any) {
    this.server.to(`merchant_${merchantId}`).emit(event, payload);
  }
}
