import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cart, CartItemTopping, Merchant, Product, Topping } from 'src/models';
import { CartItem } from 'src/models/cart_item.model';
import { CartItemToppingModule } from '../cart-item-topping/cart-item-topping.module';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { CartItemController } from './cart-item.controller';
import { CartItemService } from './cart-item.service';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService],
  imports: [
    SequelizeModule.forFeature([
      CartItem,
      Cart,
      Product,
      CartItemTopping,
      Topping,
      Merchant,
    ]),
    SequelizeModule,
    forwardRef(() => ProductModule),
    forwardRef(() => CartItemToppingModule),
    forwardRef(() => CartModule),
  ],
  exports: [CartItemService],
})
export class CartItemModule {}
