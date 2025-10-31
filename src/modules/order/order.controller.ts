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

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('Missing user ID');
      }

      // Gắn userId lại vào DTO (đảm bảo đúng user)
      createOrderDto.userId = userId;

      // Gọi service xử lý tạo đơn
      const order = await this.orderService.createOrder(createOrderDto);

      return {
        success: true,
        message: 'Tạo đơn hàng thành công',
        data: order,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
