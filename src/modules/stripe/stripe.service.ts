import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from 'src/models/order.model';
import Stripe from 'stripe';
import { CartItemService } from '../cart-item/cart-item.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly cartItemService: CartItemService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey)
      throw new Error('Missing STRIPE_SECRET_KEY in environment variables');

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  /** Tạo checkout session */
  async createCheckoutSession(orderNumber: string, amount: number) {
    const exchangeRate = 27366; // 1 USD = 25,000 VND
    const amountUSD = amount / exchangeRate; // chuyển sang USD
    const amountCents = Math.round(amountUSD * 100); // chuyển sang cents

    if (amountCents > 999_999_99) {
      throw new Error(
        "The total amount exceeds Stripe's maximum of $999,999.99",
      );
    }
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Order #${orderNumber}` },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.STRIPE_SUCCESS_URL}?orderNumber=${orderNumber}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL}?orderNumber=${orderNumber}`,
      metadata: { orderNumber },
      payment_intent_data: { metadata: { orderNumber } },
    });

    return { url: session.url };
  }

  /** Xác thực webhook */
  constructEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  /** Xử lý webhook từ Stripe */
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }

      case 'checkout.session.expired': {
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionExpired(expiredSession);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const orderNumber = session.metadata?.orderNumber;
    if (!orderNumber) return;

    if (session.payment_status !== 'paid') {
      console.warn(`Session not paid: ${session.payment_status}`);
      return;
    }

    const paymentIntentId = session.payment_intent as string;

    const order = await this.orderService.updateOrderInfo(orderNumber, {
      paymentStatus: PaymentStatus.PAID,
      stripePaymentIntentId: paymentIntentId,
    } as any);

    if (order) {
      const userId = order.userId;
      const merchantId = order.merchantId;

      await this.cartItemService.clearCart(userId, merchantId);
    }
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
    const orderNumber = session.metadata?.orderNumber;
    if (!orderNumber) return;

    await this.orderService.updateOrderInfo(orderNumber, {
      paymentStatus: PaymentStatus.FAILED,
      status: OrderStatus.CANCELLED,
    } as any);
  }
}
