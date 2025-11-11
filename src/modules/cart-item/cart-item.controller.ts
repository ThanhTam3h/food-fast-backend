import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/cart-item.dto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import { extractUserIdFromRequest } from 'src/common/helpers/jwt';
import { CartService } from '../cart/cart.service';
import { actionUpdateCartItem } from './types/cartItem.type';

@Controller('cart-item')
export class CartItemController {
  constructor(
    private readonly cartItemService: CartItemService,
    private readonly cartService: CartService,
    private readonly JWTservice: JwtService,
    private readonly configService: ConfigService,
    private readonly transaction: Sequelize,
  ) {}

  @Post('/addtocart/:merchantId')
  @ApiBearerAuth('access-token')
  async addToCart(
    @Param('merchantId') merchantId: number,
    @Body() dataAdd: CreateCartItemDto,
    @Req() req: Request,
  ) {
    const userId = extractUserIdFromRequest(
      req,
      this.JWTservice,
      this.configService,
    );
    return await this.cartItemService.addToCart(dataAdd, userId, merchantId);
  }


  @Patch('/:cartItemId/quantity/:merchantId')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'cartItemId', type: Number })
  @ApiParam({ name: 'merchantId', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['increment', 'decrement'] },
      },
    },
  })
  async updateQuantity(
    @Param('cartItemId') cartItemId: number,
    @Param('merchantId') merchantId: number,
    @Body('action') action: string,
    @Req() req: Request,
  ) {
    const userId = extractUserIdFromRequest(
      req,
      this.JWTservice,
      this.configService,
    );
    return await this.cartItemService.increOrDecreQuantity(
      cartItemId,
      action as actionUpdateCartItem,
      userId,
      merchantId,
    );
  }

  @Delete('/:merchantId/:cartItemId')
  @ApiBearerAuth('access-token')
  async deleteCartItem(
    @Param('cartItemId') cartItemId: number,
    @Param('merchantId') merchantId: number,
    @Req() req: Request,
  ) {
    const userId = extractUserIdFromRequest(
      req,
      this.JWTservice,
      this.configService,
    );

    return await this.cartItemService.deleteCartItem(
      cartItemId,
      userId,
      merchantId,
    );
  }

  @Get('/get-cartitems/:merchantId')
  @ApiBearerAuth('access-token')
  async getCartItemsByUser(
    @Param('merchantId') merchantId: number,
    @Req() req: Request,
  ) {
    const transaction = await this.transaction.transaction();
    try {
      const userId = extractUserIdFromRequest(
        req,
        this.JWTservice,
        this.configService,
      );

      const cart = await this.cartService.getCartByUserIdAndMerchant(
        userId,
        merchantId,
        transaction,
      );

      if (!cart) {
        await transaction.commit();
        return { message: 'Giỏ hàng trống', data: [] };
      }

      const result = await this.cartItemService.getCartItemByCartId(
        cart.id,
        userId,
        merchantId,
        transaction,
      );

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw new BadGatewayException(error.message || 'Unknown error');
    }
  }

}
