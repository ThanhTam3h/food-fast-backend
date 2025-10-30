import { forwardRef, Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartItem } from 'src/models/cart_item.model';
import { Cart, CartItemTopping, Product, ProductTopping, ProductVariant, Topping } from 'src/models';
import { ProductModule } from '../product/product.module';
import { ProductVariantModule } from '../product-variant/product-variant.module';
import { CartItemToppingModule } from '../cart-item-topping/cart-item-topping.module';
import { CartModule } from '../cart/cart.module';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService],
  imports: [
    SequelizeModule.forFeature([
      CartItem,
      Cart,
      Product,
      ProductVariant,
      CartItemTopping,
      ProductTopping,
      Topping,
    ]),
    SequelizeModule,
    forwardRef(() =>ProductModule),
    forwardRef(() =>ProductVariantModule),
    forwardRef(() =>CartItemToppingModule),
    forwardRef(() =>CartModule),
  ],
  exports: [CartItemService],
})
export class CartItemModule {}
