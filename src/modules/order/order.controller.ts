import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/global-guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Order, PaymentMethod } from 'src/models/order.model';
import { StripeService } from '../stripe/stripe.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly stripeService: StripeService,
  ) {}

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

      //  Tạo đơn hàng tạm trong DB
      const order = await this.orderService.createOrder(createOrderDto);

      //  Nếu là thanh toán online -> tạo Stripe Checkout Session
      if (createOrderDto.paymentMethod === PaymentMethod.ONLINE) {
        const session = await this.stripeService.createCheckoutSession(
          order.orderNumber, // mã đơn hàng
          order.total, // tổng tiền
        );

        // Trả về URL để frontend redirect qua Stripe
        return {
          success: true,
          message: 'Tạo đơn hàng và phiên thanh toán Stripe thành công',
          data: {
            order,
            paymentUrl: session.url, // URL để redirect người dùng thanh toán
          },
        };
      }

      // Nếu không phải thanh toán online -> trả về đơn hàng bình thường
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

  @Public()
  @ApiParam({
    name: 'orderNumber',
    required: true,
    example: 'ORD-123456',
    description: 'Mã đơn hàng cần cập nhật',
  })
  @ApiBody({
    description: 'Dữ liệu cần cập nhật cho đơn hàng',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'SHIPPING',
        },
      },
    },
  })
  @Patch('update/:orderNumber')
  async updateOrderInfo(
    @Param('orderNumber') orderNumber: string,
    @Body() updateData: Partial<Order>,
  ) {
    return this.orderService.updateOrderInfo(orderNumber, updateData);
  }

  @Public()
  @Get('/:orderNumber')
  async getOrderItemsByOrderId(@Param('orderNumber') orderNumber: string) {
    return this.orderService.getOrderItemsByOrderId(orderNumber);
  }
}
