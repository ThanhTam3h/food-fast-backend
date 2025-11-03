import { forwardRef, Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [forwardRef(() => OrderModule)],
  exports: [StripeService],
})
export class StripeModule {}
