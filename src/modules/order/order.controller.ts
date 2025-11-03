import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { PaymentMethod } from 'src/models/order.model';
import { StripeService } from '../stripe/stripe.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService,
  ) {}

  // @Post('create')
  // @ApiBearerAuth('access-token')
  // @Roles('customer', 'admin')
  // async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       throw new BadRequestException('Missing user ID');
  //     }

  //     // Gắn userId lại vào DTO (đảm bảo đúng user)
  //     createOrderDto.userId = userId;

  //     // Gọi service xử lý tạo đơn
  //     const order = await this.orderService.createOrder(createOrderDto);

  //     return {
  //       success: true,
  //       message: 'Tạo đơn hàng thành công',
  //       data: order,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  @Post('create')
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('Missing user ID');
      }

      // Gắn userId vào DTO
      createOrderDto.userId = userId;

      // ✅ 1. Tạo đơn hàng tạm trong DB
      const order = await this.orderService.createOrder(createOrderDto);

      // ✅ 2. Nếu là thanh toán online -> tạo Stripe Checkout Session
      if (createOrderDto.paymentMethod === PaymentMethod.ONLINE) {
        const session = await this.stripeService.createCheckoutSession(
          order.orderNumber, // mã đơn hàng
          order.total, // tổng tiền
        );

        // ✅ Trả về URL để frontend redirect qua Stripe
        return {
          success: true,
          message: 'Tạo đơn hàng và phiên thanh toán Stripe thành công',
          data: {
            order,
            paymentUrl: session.url, // 👈 URL để redirect người dùng thanh toán
          },
        };
      }

      // ✅ 3. Nếu không phải thanh toán online -> trả về đơn hàng bình thường
      return {
        success: true,
        message: 'Tạo đơn hàng thành công (thanh toán offline)',
        data: order,
      };
    } catch (error) {
      console.error('Create order error:', error);
      throw new BadRequestException(error.message);
    }
  }
}
