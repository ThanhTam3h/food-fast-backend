import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Address,
  Drone,
  DroneHub,
  Merchant,
  Order,
  OrderItem,
  OrderItemTopping,
  Product,
  Topping,
  User,
} from 'src/models';
import { AddressModule } from '../address/address.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { StripeModule } from '../stripe/stripe.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    SequelizeModule.forFeature([
      Order,
      Address,
      OrderItem,
      Product,
      Topping,
      OrderItemTopping,
      User,
      Drone,
      DroneHub,
      Merchant
    ]),
    AddressModule,
    WebsocketModule,
    forwardRef(() => StripeModule),
  ],
  exports: [OrderService],
})
export class OrderModule {}
