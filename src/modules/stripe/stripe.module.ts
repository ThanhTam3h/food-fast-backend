import { forwardRef, Module } from '@nestjs/common';
import { CartItemModule } from '../cart-item/cart-item.module';
import { OrderModule } from '../order/order.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [forwardRef(() => OrderModule), forwardRef(() => CartItemModule)],
  exports: [StripeService],
})
export class StripeModule {}
