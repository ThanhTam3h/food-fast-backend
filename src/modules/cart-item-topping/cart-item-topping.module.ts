import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartItem, CartItemTopping, Topping } from 'src/models';
import { CartToppingController } from './cart-item-topping.controller';
import { CartItemToppingService } from './cart-item-topping.service';

@Module({
  controllers: [CartToppingController],
  providers: [CartItemToppingService],
  imports: [SequelizeModule.forFeature([CartItem, Topping, CartItemTopping])],
  exports: [CartItemToppingService],
})
export class CartItemToppingModule {}
