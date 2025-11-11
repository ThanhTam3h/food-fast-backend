import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Address,
  Order,
  OrderItem,
  OrderItemTopping,
  Product,
  Topping,
} from 'src/models';
import { AddressModule } from '../address/address.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { StripeModule } from '../stripe/stripe.module';

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
    ]),
    AddressModule,
    forwardRef(() => StripeModule),
  ],
  exports: [OrderService],
})
export class OrderModule {}
