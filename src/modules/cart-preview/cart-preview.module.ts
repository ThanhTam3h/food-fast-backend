import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Address,
  Cart,
  CartItem,
  CartItemTopping,
  Product,
  ProductTopping,
  ProductVariant,
  Topping,
} from 'src/models';
import { AddressModule } from '../address/address.module';
import { CartItemModule } from '../cart-item/cart-item.module';
import { CartModule } from '../cart/cart.module';
import { CartPreviewController } from './cart-preview.controller';
import { CartPreviewService } from './cart-preview.service';

@Module({
  controllers: [CartPreviewController],
  providers: [CartPreviewService],
  imports: [
    SequelizeModule.forFeature([
      Cart,
      CartItem,
      CartItemTopping,
      Product,
      ProductTopping,
      ProductVariant,
      Topping,
      Address,
    ]),
    CartItemModule,
    CartModule,
    AddressModule,
  ],
  exports: [CartPreviewService],
})
export class CartPreviewModule {}
