import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Address,
  Order,
  OrderItem,
  OrderItemTopping,
  Product,
  ProductVariant,
  Topping,
} from 'src/models';
import { AddressModule } from '../address/address.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    SequelizeModule.forFeature([
      Order,
      Address,
      OrderItem,
      ProductVariant,
      Product,
      Topping,
      OrderItemTopping,
    ]),
    AddressModule,
  ],
  exports: [OrderService],
})
export class OrderModule {}
