import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
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
  @ApiBearerAuth('access-token')
  // @Roles('merchant', 'admin')
  async updateOrderInfo(
    @Req() req: any,
    @Param('orderNumber') orderNumber: string,
    @Body() updateData: Partial<Order>,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }
    return this.orderService.updateOrderInfo(orderNumber, updateData);
  }

  @Get('merchant/:merchantId')
  @ApiBearerAuth('access-token')
  @Roles('merchant', 'admin')
  async getOrdersByMerchant(
    @Param('merchantId') merchantId: number,
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }

    const finalStatus = status && status !== '[]' ? status : undefined;

    return await this.orderService.getOrdersByMerchantId(
      merchantId,
      finalStatus,
    );
  }

  @Get('/:orderNumber')
  // @ApiBearerAuth('access-token')
  // @Roles('merchant', 'admin')
  async getOrderItemsByOrderId(
    @Req() req: any,
    @Param('orderNumber') orderNumber: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Missing user ID');
    }
    return this.orderService.getOrderItemsByOrderId(orderNumber);
  }
}
