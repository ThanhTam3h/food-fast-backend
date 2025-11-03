import type { RawBodyRequest } from '@nestjs/common'; // Dùng import type
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/global-guard';
import { StripeService } from '../stripe/stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Public()
  @Post('create-checkout-session')
  async createSession(@Body() body: { orderId: string; amount: number }) {
    return this.stripeService.createCheckoutSession(body.orderId, body.amount);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    console.log(signature);

    console.log(
      'rawBody exists:',
      !!req.rawBody,
      'length:',
      req.rawBody?.length,
    );
    console.log('Signature:', signature);

    try {
      const event = this.stripeService.constructEvent(req.rawBody, signature);

      await this.stripeService.handleWebhookEvent(event);
      return { received: true };
    } catch (err) {
      console.error('Webhook error:', err.message);
      throw new BadRequestException('Invalid webhook payload');
    }
  }
}
