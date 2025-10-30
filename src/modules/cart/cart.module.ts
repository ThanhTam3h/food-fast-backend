import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cart } from 'src/models';
import { CartItemModule } from '../cart-item/cart-item.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
    SequelizeModule.forFeature([Cart]),
    forwardRef(() => CartItemModule),
  ],
  exports: [CartService],
})
export class CartModule {}
