import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CartService } from '../cart/cart.service';
import { CartPreviewService } from './cart-preview.service';
import { CheckoutCaculateDto } from './dto/checkout.dto';

@ApiTags('Cart Preview')
@Controller('cart-preview')
export class CartPreviewController {
  constructor(
    private readonly cartPreviewService: CartPreviewService,
    private readonly sequelize: Sequelize,
    private readonly configService: ConfigService,
    private readonly cartService: CartService,
  ) {}

  @Post('/checkout-preview/:merchantId')
  @ApiParam({
    name: 'merchantId',
    required: true,
    example: 7,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cartItemId: {
          type: 'array',
          items: { type: 'number' },
          example: [1],
        },
      },
    },
  })
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  async getCartPreview(
    @Body('cartItemId') cartItemId: number[],
    @Param('merchantId') merchantId: number,
    @Req() req: any,
  ) {
    const transaction = await this.sequelize.transaction();
    const userId = req.user.id;
    return await this.cartPreviewService.cartPreview(
      userId,
      merchantId,
      cartItemId,
      transaction,
    );
  }

  @Post('/checkout-calculate/:merchantId')
  @ApiParam({
    name: 'merchantId',
    required: true,
    example: 7,
  })
  @ApiBody({
    type: CheckoutCaculateDto,
  })
  @ApiBearerAuth('access-token')
  @Roles('customer', 'admin')
  async checkoutCaculate(
    @Req() req: any,
    @Param('merchantId') merchantId: number,
    @Body() dto: CheckoutCaculateDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      if (!dto.addressId && !dto.temporaryAddress) {
        throw new BadRequestException(
          'Either addressId or temporaryAddress must be provided.',
        );
      }

      if (dto.addressId && dto.temporaryAddress) {
        throw new BadRequestException(
          'Cannot use both addressId and temporaryAddress at the same time.',
        );
      }

      const userId = req.user.id;

      if (!userId) {
        throw new BadRequestException('User id not found');
      }

      return await this.cartPreviewService.checkoutCaculate(
        userId,
        merchantId,
        dto,
        transaction,
      );
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw new BadRequestException(error.message);
    }
  }
}
