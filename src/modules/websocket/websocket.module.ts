import { Module } from '@nestjs/common';
import { OrderStatusGateway } from './order-status.gateway';

@Module({
  providers: [OrderStatusGateway],
  exports: [OrderStatusGateway],
})
export class WebsocketModule {}
